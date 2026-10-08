import sqlite3
import pandas as pd
import os
import re
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(__file__), "ecommerce.db")
APP_DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")
USER_DBS_DIR = os.path.join(os.path.dirname(__file__), "user_dbs")

PROTECTED_TABLES = {"customers", "products", "orders", "order_items"}

os.makedirs(USER_DBS_DIR, exist_ok=True)

def get_user_db_path(user_id: Optional[int]) -> Optional[str]:
    if not user_id:
        return None
    return os.path.join(USER_DBS_DIR, f"user_{user_id}.db")

def clean_ecommerce_db():
    """Removes any user-uploaded tables from ecommerce.db so it strictly contains built-in sample tables."""
    if not os.path.exists(DB_PATH):
        return
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    tables = [r[0] for r in cur.fetchall()]
    for tbl in tables:
        if tbl not in PROTECTED_TABLES:
            cur.execute(f'DROP TABLE IF EXISTS "{tbl}"')
    conn.commit()
    conn.close()

def init_db():
    """Initializes the e-commerce database."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Remove existing tables
    cur.executescript("""
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS customers;
    """)

    # Create tables
    cur.executescript("""
    CREATE TABLE customers (
        customer_id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        country TEXT NOT NULL,
        signup_date TEXT NOT NULL
    );

    CREATE TABLE products (
        product_id INTEGER PRIMARY KEY,
        product_name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        stock_quantity INTEGER NOT NULL
    );

    CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        order_date TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );

    CREATE TABLE order_items (
        item_id INTEGER PRIMARY KEY,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
    """)

    # Seed Customers
    cust_data = [
        (1, "Alice", "Smith", "alice@example.com", "USA", "2024-01-15"),
        (2, "Bob", "Jones", "bob@example.com", "UK", "2024-02-10"),
        (3, "Charlie", "Brown", "charlie@example.com", "Canada", "2024-03-05"),
        (4, "Diana", "Prince", "diana@example.com", "Germany", "2024-03-20"),
        (5, "Evan", "Wright", "evan@example.com", "USA", "2024-04-12"),
    ]
    cur.executemany("INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?)", cust_data)

    # Seed Products
    prod_data = [
        (1, "Wireless Headphones", "Electronics", 99.99, 50),
        (2, "Smart Watch", "Electronics", 199.99, 30),
        (3, "Gaming Mouse", "Electronics", 49.99, 80),
        (4, "Running Shoes", "Apparel", 89.99, 100),
        (5, "Denim Jacket", "Apparel", 120.00, 45),
        (6, "Coffee Maker", "Home & Kitchen", 79.50, 25),
        (7, "Blender Pro", "Home & Kitchen", 59.99, 40),
    ]
    cur.executemany("INSERT INTO products VALUES (?, ?, ?, ?, ?)", prod_data)

    # Seed Orders
    ord_data = [
        (101, 1, "2024-05-01", 299.98, "Completed"),
        (102, 2, "2024-05-03", 89.99, "Completed"),
        (103, 3, "2024-05-04", 139.49, "Shipped"),
        (104, 1, "2024-05-10", 79.50, "Completed"),
        (105, 4, "2024-05-15", 319.99, "Completed"),
        (106, 5, "2024-05-18", 49.99, "Processing"),
        (107, 2, "2024-05-20", 240.00, "Completed"),
    ]
    cur.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?)", ord_data)

    # Seed Order Items
    item_data = [
        (1, 101, 1, 1, 99.99),
        (2, 101, 2, 1, 199.99),
        (3, 102, 4, 1, 89.99),
        (4, 103, 3, 1, 49.99),
        (5, 103, 4, 1, 89.99),
        (6, 104, 6, 1, 79.50),
        (7, 105, 2, 1, 199.99),
        (8, 105, 5, 1, 120.00),
        (9, 106, 3, 1, 49.99),
        (10, 107, 5, 2, 120.00),
    ]
    cur.executemany("INSERT INTO order_items VALUES (?, ?, ?, ?, ?)", item_data)

    conn.commit()
    conn.close()
    clean_ecommerce_db()

def ensure_meta_tables():
    """Initializes the user database."""
    conn = sqlite3.connect(APP_DB_PATH)
    cur = conn.cursor()

    cur.executescript("""
    CREATE TABLE IF NOT EXISTS app_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_id TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        picture TEXT,
        created_at TEXT NOT NULL,
        last_login TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_queries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_email TEXT NOT NULL,
        question TEXT NOT NULL,
        sql_query TEXT,
        status TEXT NOT NULL,
        prompt_tokens INTEGER DEFAULT 0,
        completion_tokens INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        cost_usd REAL DEFAULT 0.0,
        latency_ms INTEGER DEFAULT 0,
        retry_count INTEGER DEFAULT 0,
        langfuse_trace_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES app_users(id)
    );
    """)
    conn.commit()
    conn.close()

def clean_table(name: str) -> str:
    """Sanitizes user filename/table name."""
    s = re.sub(r'[^a-zA-Z0-9_]', '_', name.strip().lower())
    if s and s[0].isdigit():
        s = f"t_{s}"
    return s or "uploaded_data"

def clean_col(name: str) -> str:
    """Sanitizes column name."""
    s = re.sub(r'[^a-zA-Z0-9_]', '_', str(name).strip().lower())
    if s and s[0].isdigit():
        s = f"col_{s}"
    return s or "col"

def format_datetime(value):
    """Formats database timestamps for human-readable display."""
    if not value:
        return "Never"
    try:
        dt = pd.to_datetime(value)
        return dt.strftime("%b %d, %Y, %I:%M %p")
    except Exception:
        return value

def import_df(df: pd.DataFrame, tbl_name: str, user_id: int) -> dict:
    """Imports a pandas DataFrame into user_{user_id}.db dedicated database."""
    if not user_id:
        raise ValueError("Authentication required to upload dataset.")

    tbl = clean_table(tbl_name)
    if tbl in PROTECTED_TABLES:
        raise ValueError(
            f"Table name '{tbl}' is reserved for sample business tables. Please choose a different name."
        )

    new_cols = []
    seen = {}
    for c in df.columns:
        sc = clean_col(c)
        if sc in seen:
            seen[sc] += 1
            new_cols.append(f"{sc}_{seen[sc]}")
        else:
            seen[sc] = 1
            new_cols.append(sc)
    df.columns = new_cols

    user_db_path = get_user_db_path(user_id)
    conn = sqlite3.connect(user_db_path)
    cur = conn.cursor()

    cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (tbl,)
    )
    existing = cur.fetchone()

    if existing:
        conn.close()
        raise ValueError(
            f"Table '{tbl}' already exists in your datasets. Please enter a new name."
        )

    df.to_sql(tbl, conn, if_exists="fail", index=False)

    conn.commit()
    conn.close()

    return {
        "table_name": tbl,
        "rows_imported": len(df),
        "columns": list(df.columns)
    }

def get_or_create_user(google_id: str, email: str, name: str, picture: str = "") -> dict:
    ensure_meta_tables()
    conn = sqlite3.connect(APP_DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT * FROM app_users WHERE google_id = ?", (google_id,))
    user = cur.fetchone()
    now_iso = pd.Timestamp.now().isoformat()

    if user:
        cur.execute("UPDATE app_users SET last_login = ?, name = ?, picture = ? WHERE id = ?", 
                    (now_iso, name, picture, user['id']))
        conn.commit()
        user_id = user['id']
    else:
        cur.execute("INSERT INTO app_users (google_id, email, name, picture, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?)",
                    (google_id, email, name, picture, now_iso, now_iso))
        conn.commit()
        user_id = cur.lastrowid

    cur.execute("SELECT * FROM app_users WHERE id = ?", (user_id,))
    res = dict(cur.fetchone())
    conn.close()

    res["created_at"] = format_datetime(res["created_at"])
    res["last_login"] = format_datetime(res["last_login"])

    return res

def get_user_by_id(user_id: int) -> dict:
    ensure_meta_tables()
    conn = sqlite3.connect(APP_DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM app_users WHERE id = ?", (user_id,))
    user = cur.fetchone()
    conn.close()
    if not user:
        return None

    user = dict(user)

    user["created_at"] = format_datetime(user["created_at"])
    user["last_login"] = format_datetime(user["last_login"])

    return user

def log_user_query(user_id: int, user_email: str, question: str, sql_query: str, status: str,
                   prompt_tokens: int, completion_tokens: int, total_tokens: int,
                   cost_usd: float, latency_ms: int, retry_count: int, langfuse_trace_id: str) -> int:
    ensure_meta_tables()
    conn = sqlite3.connect(APP_DB_PATH)
    cur = conn.cursor()
    now_iso = pd.Timestamp.now().isoformat()
    cur.execute("""
        INSERT INTO user_queries 
        (user_id, user_email, question, sql_query, status, prompt_tokens, completion_tokens, total_tokens, cost_usd, latency_ms, retry_count, langfuse_trace_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, user_email, question, sql_query, status, prompt_tokens, completion_tokens, total_tokens, cost_usd, latency_ms, retry_count, langfuse_trace_id, now_iso))
    conn.commit()
    qid = cur.lastrowid
    conn.close()
    return qid

def delete_table(table_name: str, user_id: int) -> bool:
    """Deletes a user-created table from user_{user_id}.db."""
    if table_name in PROTECTED_TABLES:
        raise ValueError(
            f"Table '{table_name}' is a built-in sample table and cannot be deleted."
        )

    if not user_id:
        return False

    user_db_path = get_user_db_path(user_id)
    if not os.path.exists(user_db_path):
        return False

    conn = sqlite3.connect(user_db_path)
    cur = conn.cursor()
    cur.execute(
        """
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name = ?
        """,
        (table_name,)
    )

    existing = cur.fetchone()
    if not existing:
        conn.close()
        return False

    cur.execute(f'DROP TABLE "{table_name}"')
    conn.commit()
    conn.close()
    return True

def get_user_dashboard_stats(user_id: int, page: int = 1, limit: int = 10) -> dict:
    ensure_meta_tables()
    page = max(page, 1)
    limit = max(1, min(limit, 50))
    offset = (page - 1) * limit

    conn = sqlite3.connect(APP_DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT * FROM app_users WHERE id = ?", (user_id,))
    u_row = cur.fetchone()
    if not u_row:
        conn.close()
        return None

    user_data = dict(u_row)
    user_data["created_at"] = format_datetime(user_data["created_at"])
    user_data["last_login"] = format_datetime(user_data["last_login"])

    cur.execute("""
        SELECT
            COUNT(*) as total_queries,
            SUM(total_tokens) as aggregate_tokens,
            SUM(prompt_tokens) as aggregate_prompt_tokens,
            SUM(completion_tokens) as aggregate_completion_tokens,
            SUM(cost_usd) as aggregate_cost_usd,
            AVG(latency_ms) as avg_latency_ms
        FROM user_queries
        WHERE user_id = ?
    """, (user_id,))
    agg = dict(cur.fetchone())

    cur.execute("""
        SELECT COUNT(*)
        FROM user_queries
        WHERE user_id = ?
    """, (user_id,))
    total = cur.fetchone()[0]
    total_pages = (total + limit - 1) // limit

    cur.execute("""
        SELECT
            id,
            created_at,
            total_tokens,
            cost_usd,
            latency_ms
        FROM user_queries
        WHERE user_id = ?
        ORDER BY id ASC
    """, (user_id,))

    usage_chart = [
        {
            "id": row["id"],
            "created_at": row["created_at"],
            "total_tokens": row["total_tokens"] or 0,
            "cost_usd": row["cost_usd"] or 0.0,
            "latency_ms": row["latency_ms"] or 0,
        }
        for row in cur.fetchall()
    ]

    cur.execute("""
        SELECT *
        FROM user_queries
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    """, (user_id, limit, offset))
    recent_queries = [dict(r) for r in cur.fetchall()]

    conn.close()

    return {
        "user": user_data,
        "summary": {
            "total_queries": agg["total_queries"] or 0,
            "aggregate_tokens": agg["aggregate_tokens"] or 0,
            "aggregate_prompt_tokens": agg["aggregate_prompt_tokens"] or 0,
            "aggregate_completion_tokens": agg["aggregate_completion_tokens"] or 0,
            "aggregate_cost_usd": round(agg["aggregate_cost_usd"] or 0.0, 6),
            "avg_latency_ms": round(agg["avg_latency_ms"] or 0, 2)
        },
        "usage_chart": usage_chart,
        "recent_queries": recent_queries,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages
        }
    }

def get_user_history(user_id: int, page: int = 1, limit: int = 10) -> dict:
    ensure_meta_tables()
    page = max(page, 1)
    limit = max(1, min(limit, 10))
    offset = (page - 1) * limit

    conn = sqlite3.connect(APP_DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute(
        """
        SELECT COUNT(*)
        FROM user_queries
        WHERE user_id = ?
        """,
        (user_id,)
    )
    total = cur.fetchone()[0]
    total_pages = (total + limit - 1) // limit
    cur.execute(
        """
        SELECT *
        FROM user_queries
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        """,
        (user_id, limit, offset)
    )
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()

    for r in rows:
        r["created_at"] = format_datetime(r.get("created_at"))

    return {
        "history": rows,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages
        }
    }

def clear_user_history(user_id: int) -> bool:
    ensure_meta_tables()
    conn = sqlite3.connect(APP_DB_PATH)
    cur = conn.cursor()
    cur.execute("DELETE FROM user_queries WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()
    return True

def get_schema(user_id: Optional[int] = None) -> str:
    """Extracts schema and sample data strictly from ecommerce.db + user's isolated db."""
    if not os.path.exists(DB_PATH):
        init_db()
    
    parts = []
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
    SELECT name, sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
      AND name IN ('customers', 'products', 'orders', 'order_items');
""")

    base_tables = cur.fetchall()
    for tbl, ddl in base_tables:
        sample_df = pd.read_sql_query(f"SELECT * FROM `{tbl}` LIMIT 2;", conn)
        sample = sample_df.to_string(index=False)
        parts.append(f"Table: {tbl}\nSchema:\n{ddl}\nSample Data:\n{sample}\n")
    conn.close()

    if user_id:
        user_db_path = get_user_db_path(user_id)
        if os.path.exists(user_db_path):
            u_conn = sqlite3.connect(user_db_path)
            u_cur = u_conn.cursor()
            u_cur.execute("""
                SELECT name, sql FROM sqlite_master
                WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
            """)
            u_tables = u_cur.fetchall()
            for tbl, ddl in u_tables:
                sample_df = pd.read_sql_query(f"SELECT * FROM `{tbl}` LIMIT 2;", u_conn)
                sample = sample_df.to_string(index=False)
                parts.append(f"Table (User Custom): {tbl}\nSchema:\n{ddl}\nSample Data:\n{sample}\n")
            u_conn.close()

    return "\n".join(parts)

def get_schema_details(user_id: Optional[int] = None) -> dict:
    """Fetches structured table metadata for API consumers."""
    if not os.path.exists(DB_PATH):
        init_db()

    raw = get_schema(user_id)
    tables = []
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        SELECT name, sql FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
          AND name IN ('customers', 'products', 'orders', 'order_items');
    """)
    base_meta = cur.fetchall()
    for tbl, ddl in base_meta:
        cur.execute(f"PRAGMA table_info(`{tbl}`);")
        cols = [{"cid": r[0], "name": r[1], "type": r[2], "notnull": bool(r[3]), "pk": bool(r[5])} for r in cur.fetchall()]
        df = pd.read_sql_query(f"SELECT * FROM `{tbl}` LIMIT 5;", conn)
        df = df.astype(object).where(pd.notna(df), None)
        rows = df.to_dict(orient="records")
        cur.execute(f"SELECT count(*) FROM `{tbl}`")
        count = cur.fetchone()[0]
        tables.append({
            "name": tbl,
            "ddl": ddl,
            "columns": cols,
            "sample_rows": rows,
            "total_rows": count,
            "is_custom": False
        })
    conn.close()

    if user_id:
        user_db_path = get_user_db_path(user_id)
        if os.path.exists(user_db_path):
            u_conn = sqlite3.connect(user_db_path)
            u_cur = u_conn.cursor()
            u_cur.execute("""
                SELECT name, sql FROM sqlite_master
                WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
            """)
            u_meta = u_cur.fetchall()
            for tbl, ddl in u_meta:
                u_cur.execute(f"PRAGMA table_info(`{tbl}`);")
                cols = [{"cid": r[0], "name": r[1], "type": r[2], "notnull": bool(r[3]), "pk": bool(r[5])} for r in u_cur.fetchall()]
                df = pd.read_sql_query(f"SELECT * FROM `{tbl}` LIMIT 5;", u_conn)
                df = df.astype(object).where(pd.notna(df), None)
                rows = df.to_dict(orient="records")
                u_cur.execute(f"SELECT count(*) FROM `{tbl}`")
                count = u_cur.fetchone()[0]
                tables.append({
                    "name": tbl,
                    "ddl": ddl,
                    "columns": cols,
                    "sample_rows": rows,
                    "total_rows": count,
                    "is_custom": True
                })
            u_conn.close()

    return {
        "raw_schema": raw,
        "tables": tables
    }

def run_sql(sql: str, user_id: Optional[int] = None) -> pd.DataFrame:
    """Executes SQL query against ecommerce.db attached with user's isolated db."""
    conn = sqlite3.connect(DB_PATH)
    if user_id:
        user_db_path = get_user_db_path(user_id)
        if os.path.exists(user_db_path):
            conn.execute(f"ATTACH DATABASE '{user_db_path}' AS udb;")
    df = pd.read_sql_query(sql, conn)
    conn.close()
    return df

clean_ecommerce_db()
