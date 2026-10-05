import sqlite3
import pandas as pd
import os
import re

DB_PATH = os.path.join(os.path.dirname(__file__), "ecommerce.db")
APP_DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")

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

def import_df(df: pd.DataFrame, tbl_name: str, replace: bool = True) -> dict:
    """Imports a pandas DataFrame as a table in ecommerce.db."""
    if not os.path.exists(DB_PATH):
        init_db()

    tbl = clean_table(tbl_name)
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

    conn = sqlite3.connect(DB_PATH)
    if_exists = 'replace' if replace else 'append'
    df.to_sql(tbl, conn, if_exists=if_exists, index=False)
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

def get_user_dashboard_stats(user_id: int) -> dict:
    ensure_meta_tables()
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
        SELECT * FROM user_queries 
        WHERE user_id = ? 
        ORDER BY id DESC 
        LIMIT 50
    """, (user_id,))
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
        "recent_queries": recent_queries
    }

def get_schema() -> str:
    """Extracts schema and sample data strictly from ecommerce.db."""
    if not os.path.exists(DB_PATH):
        init_db()
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    cur.execute("""
    SELECT name, sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
      AND name NOT IN ('app_users', 'user_queries');
""")

    tables = cur.fetchall()
    
    parts = []
    for tbl, ddl in tables:
        sample_df = pd.read_sql_query(f"SELECT * FROM `{tbl}` LIMIT 2;", conn)
        sample = sample_df.to_string(index=False)
        parts.append(f"Table: {tbl}\nSchema:\n{ddl}\nSample Data:\n{sample}\n")
        
    conn.close()
    return "\n".join(parts)

def run_sql(sql: str) -> pd.DataFrame:
    """Executes SQL query against ecommerce.db and returns DataFrame."""
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query(sql, conn)
    conn.close()
    return df
