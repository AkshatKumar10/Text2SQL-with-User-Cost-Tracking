import re
import datetime
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List, Optional

SUPPORTED_CHART_TYPES = {"bar", "line", "pie", "scatter", "kpi", "table", "none"}

def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Normalizes numeric-looking strings and dates in pandas DataFrame."""
    if df is None or df.empty:
        return pd.DataFrame()

    df_clean = df.copy()
    for col in df_clean.columns:
        non_nulls = df_clean[col].dropna()
        if len(non_nulls) == 0:
            continue

        if df_clean[col].dtype == object or isinstance(df_clean[col].dtype, pd.CategoricalDtype):
            numeric_parsed = pd.to_numeric(df_clean[col], errors='coerce')
            if numeric_parsed.notna().sum() / max(len(non_nulls), 1) > 0.8:
                df_clean[col] = numeric_parsed

    return df_clean

def profile_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Programmatically calculates compact, rich dataset statistics for LLM prompt context.
    """
    if df is None or df.empty:
        return {
            "row_count": 0,
            "columns": [],
            "profiles": {},
            "sample": []
        }

    df_clean = normalize_dataframe(df)
    row_count = len(df_clean)
    profiles = {}

    for col in df_clean.columns:
        series = df_clean[col]
        non_null = series.dropna()
        null_count = int(series.isna().sum())
        unique_count = int(series.nunique(dropna=True))

        inferred_type = "text"
        if pd.api.types.is_numeric_dtype(series):
            inferred_type = "numeric"
        elif pd.api.types.is_datetime64_any_dtype(series):
            inferred_type = "datetime"
        elif pd.api.types.is_bool_dtype(series):
            inferred_type = "boolean"
        else:
            sample_str = non_null.astype(str).head(10)
            date_matches = sample_str.apply(lambda s: bool(re.match(r'^\d{4}[-/]\d{2}[-/]\d{2}', s)))
            if date_matches.mean() > 0.7:
                inferred_type = "datetime"
            elif unique_count <= max(10, int(row_count * 0.3)):
                inferred_type = "categorical"

        min_val = None
        max_val = None
        if inferred_type == "numeric" and len(non_null) > 0:
            min_val = float(non_null.min()) if not np.isnan(non_null.min()) else None
            max_val = float(non_null.max()) if not np.isnan(non_null.max()) else None
        elif inferred_type == "datetime" and len(non_null) > 0:
            min_val = str(non_null.min())
            max_val = str(non_null.max())

        profiles[str(col)] = {
            "type": inferred_type,
            "unique_count": unique_count,
            "null_count": null_count,
            "min": min_val,
            "max": max_val,
        }

    sample_records = df_clean.head(5).astype(object).where(pd.notna(df_clean.head(5)), None).to_dict(orient="records")

    return {
        "row_count": row_count,
        "columns": [str(c) for c in df_clean.columns],
        "profiles": profiles,
        "sample": sample_records
    }

def validate_and_normalize_chart_config(
    df: pd.DataFrame,
    llm_rec_type: str,
    llm_config: Dict[str, Any],
    question: str = ""
) -> Tuple[str, Dict[str, Any]]:
    """
    Deterministic Visualization Validation/Normalization Layer (Requirement #98-102).
    Enforces semantic & structural rules between query result data and frontend renderer.
    """
    if df is None or df.empty or len(df) == 0:
        return "none", {"title": "No Results Found", "reason": "Query returned 0 rows."}

    df_clean = normalize_dataframe(df)
    cols = [str(c) for c in df_clean.columns]
    row_count = len(df_clean)

    numeric_cols = []
    datetime_cols = []
    categorical_cols = []

    for col in cols:
        series = df_clean[col].dropna()
        if pd.api.types.is_numeric_dtype(df_clean[col]):
            numeric_cols.append(col)
        elif pd.api.types.is_datetime64_any_dtype(df_clean[col]):
            datetime_cols.append(col)
        else:
            sample_str = series.astype(str).head(10)
            date_matches = sample_str.apply(lambda s: bool(re.match(r'^\d{4}[-/]\d{2}[-/]\d{2}', s)))
            if date_matches.mean() > 0.7:
                datetime_cols.append(col)
            else:
                categorical_cols.append(col)

    rec_type = str(llm_rec_type or "table").strip().lower()
    if rec_type not in SUPPORTED_CHART_TYPES:
        rec_type = "table"

    config = dict(llm_config or {})
    title = config.get("title") or question or "Query Results"

    x_col = config.get("x")
    y_col = config.get("y")
    kpi_col = config.get("kpi_value_column")
    series_cols = config.get("series") if isinstance(config.get("series"), list) else []
    color_col = config.get("color")

    if x_col not in cols:
        x_col = (categorical_cols + datetime_cols + cols)[0] if cols else None

    if y_col not in cols:
        y_col = (numeric_cols + cols)[0] if cols else None

    if kpi_col not in cols:
        kpi_col = (numeric_cols + cols)[0] if cols else None

    if color_col not in cols:
        color_col = None

    valid_series = [c for c in series_cols if c in cols and c in numeric_cols]
    if rec_type == "kpi":
        if kpi_col and kpi_col in numeric_cols:
            kpi_val = df_clean[kpi_col].dropna().iloc[0] if len(df_clean[kpi_col].dropna()) > 0 else None
            format_type = "plain"
            unit = config.get("unit")
            col_lower = kpi_col.lower()

            if "percent" in col_lower or "rate" in col_lower or "%" in col_lower or "share" in col_lower:
                format_type = "percentage"
            elif any(k in col_lower for k in ["price", "cost", "revenue", "amount", "sales", "total_amount", "unit_price", "salary"]):
                format_type = "currency"
            elif isinstance(kpi_val, (int, np.integer)):
                format_type = "integer"
            elif isinstance(kpi_val, (float, np.floating)):
                format_type = "decimal"

            if any(u in col_lower for u in ["ms", "duration", "time", "seconds", "min", "kg", "km"]):
                if "ms" in col_lower: unit = "ms"
                elif "sec" in col_lower: unit = "s"
                elif "min" in col_lower: unit = "m"
                elif "kg" in col_lower: unit = "kg"
                elif "km" in col_lower: unit = "km"
                format_type = "unit"

            return "kpi", {
                "title": title,
                "kpi_value_column": kpi_col,
                "format": format_type,
                "unit": unit,
                "currency": config.get("currency", "USD"),
            }
        elif row_count == 1 and len(numeric_cols) > 0:
            kpi_col = numeric_cols[0]
            return "kpi", {
                "title": title,
                "kpi_value_column": kpi_col,
                "format": "currency" if any(k in kpi_col.lower() for k in ["amount", "price", "cost", "revenue"]) else "decimal",
            }
        else:
            rec_type = "table"

    if rec_type == "scatter":
        if len(numeric_cols) >= 2:
            x_scat = x_col if x_col in numeric_cols else numeric_cols[0]
            y_scat = y_col if (y_col in numeric_cols and y_col != x_scat) else (numeric_cols[1] if len(numeric_cols) > 1 else numeric_cols[0])
            return "scatter", {
                "title": title,
                "x": x_scat,
                "y": y_scat,
                "color": color_col
            }
        else:
            rec_type = "bar" if (numeric_cols and (categorical_cols or datetime_cols)) else "table"

    if rec_type == "line":
        if y_col in numeric_cols and (datetime_cols or x_col in numeric_cols or x_col in datetime_cols):
            x_line = datetime_cols[0] if datetime_cols else x_col
            return "line", {
                "title": title,
                "x": x_line,
                "y": y_col,
                "series": valid_series if len(valid_series) > 1 else [y_col],
                "sort_x": True
            }
        elif y_col in numeric_cols and categorical_cols:
            rec_type = "bar"
        else:
            rec_type = "table"
    if rec_type == "pie":
        if y_col in numeric_cols and (categorical_cols or x_col in cols):
            x_pie = x_col if x_col in cols else (categorical_cols[0] if categorical_cols else cols[0])
            non_neg = (df_clean[y_col].dropna() >= 0).all()
            if not non_neg:
                rec_type = "bar"
            else:
                cardinality = df_clean[x_pie].nunique(dropna=True)
                return "pie", {
                    "title": title,
                    "x": x_pie,
                    "y": y_col,
                    "group_other": cardinality > 6
                }
        else:
            rec_type = "table"

    if rec_type == "bar":
        if y_col in numeric_cols and (x_col in cols):
            cardinality = df_clean[x_col].nunique(dropna=True) if x_col in cols else row_count
            max_label_len = df_clean[x_col].astype(str).map(len).max() if x_col in cols and len(df_clean) > 0 else 0
            use_horizontal = cardinality > 8 or max_label_len > 12

            return "bar", {
                "title": title,
                "x": x_col,
                "y": y_col,
                "series": valid_series if len(valid_series) > 1 else [y_col],
                "color": color_col,
                "layout": "horizontal" if use_horizontal else "vertical"
            }
        elif len(numeric_cols) > 0 and len(cols) > 1:
            x_bar = (categorical_cols + datetime_cols + cols)[0]
            y_bar = numeric_cols[0]
            return "bar", {
                "title": title,
                "x": x_bar,
                "y": y_bar,
                "layout": "horizontal"
            }
        else:
            rec_type = "table"

    return "table", {
        "title": title,
        "columns": cols
    }
