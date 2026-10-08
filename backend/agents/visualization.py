import re
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List, Optional

SUPPORTED_CHART_TYPES = {"bar", "line", "pie", "scatter", "kpi", "table", "none"}

# Matches 2024-05-17 and also month buckets like 2024-05
DATE_RE = re.compile(r"^\d{4}[-/]\d{2}([-/]\d{2})?")

MAX_BARS = 50              # more rows than this is unreadable as bars
MAX_PIE_CATEGORIES = 12    # more categories than this is unreadable as a pie


# ---------------------------------------------------------------------
# Column helpers
# ---------------------------------------------------------------------
def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Turns numeric-looking text columns into numbers (used for profiling and validation only)."""
    if df is None or df.empty:
        return pd.DataFrame()

    out = df.copy()
    for col in out.columns:
        s = out[col]
        if (
            pd.api.types.is_numeric_dtype(s)
            or pd.api.types.is_bool_dtype(s)
            or pd.api.types.is_datetime64_any_dtype(s)
        ):
            continue

        non_null = s.dropna()
        if non_null.empty:
            continue

        # Codes such as "00123" must stay text
        if non_null.astype(str).str.match(r"^0\d+$").any():
            continue

        parsed = pd.to_numeric(s, errors="coerce")
        if parsed.notna().sum() / len(non_null) > 0.8:
            out[col] = parsed

    return out


def _column_kind(series: pd.Series) -> str:
    """boolean | numeric | datetime | text"""
    if pd.api.types.is_bool_dtype(series):
        return "boolean"
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"

    non_null = series.dropna()
    if len(non_null) > 0:
        sample = non_null.astype(str).head(10)
        if sample.map(lambda s: bool(DATE_RE.match(s))).mean() > 0.7:
            return "datetime"
    return "text"


def profile_dataframe(df: pd.DataFrame, sample_size: int = 5) -> Dict[str, Any]:
    """Compact dataset statistics for the LLM prompt."""
    if df is None or df.empty:
        return {"row_count": 0, "columns": [], "profiles": {}, "sample": []}

    df_clean = normalize_dataframe(df)
    row_count = len(df_clean)
    profiles = {}

    for col in df_clean.columns:
        series = df_clean[col]
        non_null = series.dropna()
        unique_count = int(series.nunique(dropna=True))

        kind = _column_kind(series)
        if kind == "text" and unique_count <= max(10, int(row_count * 0.3)):
            kind = "categorical"

        min_val = None
        max_val = None
        if kind == "numeric" and len(non_null) > 0:
            min_val = float(non_null.min())
            max_val = float(non_null.max())
        elif kind == "datetime" and len(non_null) > 0:
            min_val = str(non_null.min())
            max_val = str(non_null.max())

        profiles[str(col)] = {
            "type": kind,
            "unique_count": unique_count,
            "null_count": int(series.isna().sum()),
            "min": min_val,
            "max": max_val,
        }

    head = df_clean.head(sample_size)
    sample_records = head.astype(object).where(pd.notna(head), None).to_dict(orient="records")

    return {
        "row_count": row_count,
        "columns": [str(c) for c in df_clean.columns],
        "profiles": profiles,
        "sample": sample_records,
    }


# ---------------------------------------------------------------------
# KPI formatting (whole-word matching: "total_items" is a count, not milliseconds)
# ---------------------------------------------------------------------
def _tokens(name: str) -> set:
    spaced = re.sub(r"([a-z])([A-Z])", r"\1_\2", str(name))
    return {t for t in re.split(r"[^a-z0-9]+", spaced.lower()) if t}


def kpi_format(col: str, value, config: Dict[str, Any]) -> Tuple[str, Optional[str]]:
    t = _tokens(col)
    unit = config.get("unit")

    if t & {"count", "qty", "quantity", "num", "number", "items", "orders", "customers", "products", "units"}:
        return "integer", unit  # counts are never money
    if t & {"percent", "percentage", "pct", "rate", "share", "ratio"}:
        return "percentage", unit
    if t & {"price", "cost", "revenue", "amount", "sales", "salary", "spend", "spent", "profit", "income"}:
        return "currency", unit
    for token, u in (("ms", "ms"), ("sec", "s"), ("seconds", "s"), ("minutes", "min"), ("kg", "kg"), ("km", "km")):
        if token in t:
            return "unit", u
    if isinstance(value, (int, np.integer)):
        return "integer", unit
    if isinstance(value, (float, np.floating)):
        return "decimal", unit
    return "plain", unit


# ---------------------------------------------------------------------
# Validation layer between the LLM's suggestion and the frontend renderer.
#
# bar "layout":  "vertical"   = columns (categories along the bottom)
#                "horizontal" = bars running left to right (categories down the side)
# ---------------------------------------------------------------------
def validate_and_normalize_chart_config(
    df: pd.DataFrame,
    llm_rec_type: str,
    llm_config: Dict[str, Any],
    question: str = "",
) -> Tuple[str, Dict[str, Any]]:

    if df is None or df.empty:
        return "none", {"title": "No Results Found", "reason": "Query returned 0 rows."}

    df_clean = normalize_dataframe(df)
    cols = [str(c) for c in df_clean.columns]
    df_clean.columns = cols
    row_count = len(df_clean)

    numeric_cols: List[str] = []
    datetime_cols: List[str] = []
    dimension_cols: List[str] = []  # text, categorical and boolean columns

    for c in cols:
        kind = _column_kind(df_clean[c])
        if kind == "numeric":
            numeric_cols.append(c)
        elif kind == "datetime":
            datetime_cols.append(c)
        else:
            dimension_cols.append(c)

    rec_type = str(llm_rec_type or "table").strip().lower()
    if rec_type not in SUPPORTED_CHART_TYPES:
        rec_type = "table"

    config = dict(llm_config or {})
    title = config.get("title") or question or "Query Results"

    # Remember why we had to change the chart, so the UI can say so.
    why: List[Optional[str]] = [None]

    def downgrade(reason: str):
        if why[0] is None:
            why[0] = reason

    # ---- Repair column references --------------------------------
    x_col = config.get("x")
    y_col = config.get("y")
    kpi_col = config.get("kpi_value_column")
    color_col = config.get("color") if config.get("color") in cols else None
    series_cols = config.get("series") if isinstance(config.get("series"), list) else []

    if x_col not in cols:
        x_col = next(iter(dimension_cols + datetime_cols + cols), None)

    if y_col not in numeric_cols:
        y_col = next((c for c in numeric_cols if c != x_col), None)

    if x_col == y_col:
        x_col = next((c for c in dimension_cols + datetime_cols + cols if c != y_col), None)

    valid_series = [c for c in series_cols if c in numeric_cols and c != x_col]
    series = valid_series if len(valid_series) > 1 else ([y_col] if y_col else [])

    has_dimension = bool(dimension_cols or datetime_cols)

    # ---- 1. KPI --------------------------------------------------
    if rec_type == "kpi":
        if row_count == 1 and numeric_cols:
            col = kpi_col if kpi_col in numeric_cols else numeric_cols[0]
            val = df_clean[col].dropna().iloc[0] if df_clean[col].notna().any() else None
            fmt, unit = kpi_format(col, val, config)
            return "kpi", {
                "title": title,
                "kpi_value_column": col,
                "format": fmt,
                "unit": unit,
                "currency": config.get("currency", "USD"),
            }
        downgrade("A single-value card needs exactly one row.")
        rec_type = "bar" if (numeric_cols and has_dimension) else "table"

    # ---- 2. Scatter ----------------------------------------------
    if rec_type == "scatter":
        if len(numeric_cols) >= 2 and row_count >= 3:
            x_s = x_col if x_col in numeric_cols else numeric_cols[0]
            y_s = y_col if (y_col in numeric_cols and y_col != x_s) else next(c for c in numeric_cols if c != x_s)
            return "scatter", {"title": title, "x": x_s, "y": y_s, "color": color_col}
        downgrade("A scatter plot needs two numeric columns and a few rows.")
        rec_type = "bar" if (numeric_cols and has_dimension) else "table"

    # ---- 3. Line -------------------------------------------------
    if rec_type == "line":
        x_line = datetime_cols[0] if datetime_cols else (x_col if x_col in numeric_cols else None)

        if y_col and x_line and x_line != y_col and row_count >= 2:
            if df_clean[x_line].duplicated().any():
                downgrade("The same x value appears more than once, so a line would zigzag.")
                rec_type = "table"
            else:
                return "line", {
                    "title": title,
                    "x": x_line,
                    "y": y_col,
                    "series": series,
                    "sort_x": True,
                }
        elif y_col and dimension_cols:
            downgrade("The x-axis is not a date or an ordered number, so bars fit better.")
            rec_type = "bar"
        else:
            downgrade("There is no date or numeric column to draw a trend against.")
            rec_type = "table"

    # ---- 4. Pie --------------------------------------------------
    if rec_type == "pie":
        x_pie = x_col if x_col in (dimension_cols + datetime_cols) else next(iter(dimension_cols + datetime_cols), None)

        if y_col and x_pie:
            values = df_clean[y_col].dropna()
            cardinality = int(df_clean[x_pie].nunique(dropna=True))

            if (values < 0).any() or values.sum() <= 0:
                downgrade("A pie chart needs positive values.")
                rec_type = "bar"
            elif cardinality < 2:
                downgrade("There is only one category to compare.")
                rec_type = "bar"
            elif cardinality > MAX_PIE_CATEGORIES:
                downgrade("Too many categories for a pie chart.")
                rec_type = "bar"
            else:
                return "pie", {
                    "title": title,
                    "x": x_pie,
                    "y": y_col,
                    "group_other": bool(cardinality > 6),
                }
        else:
            downgrade("A pie chart needs a category column and a numeric column.")
            rec_type = "table"

    # ---- 5. Bar --------------------------------------------------
    if rec_type == "bar":
        if not (x_col and y_col):
            downgrade("There is no numeric column to plot.")
        elif row_count > MAX_BARS:
            downgrade(f"{row_count} rows is too many to read as bars.")
        else:
            cardinality = int(df_clean[x_col].nunique(dropna=True))
            max_label_len = int(df_clean[x_col].astype(str).str.len().max())
            horizontal = cardinality > 8 or max_label_len > 16

            return "bar", {
                "title": title,
                "x": x_col,
                "y": y_col,
                "series": series,
                "color": color_col,
                "layout": "horizontal" if horizontal else "vertical",
            }

    # ---- 6. Table fallback ---------------------------------------
    return "table", {"title": title, "columns": cols, "reason": why[0]}