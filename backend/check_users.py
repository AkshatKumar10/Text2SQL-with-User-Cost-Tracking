import sqlite3
import pandas as pd
from database import APP_DB_PATH

conn = sqlite3.connect(APP_DB_PATH)

df = pd.read_sql_query("""
    SELECT
        id,
        name,
        email,
        created_at,
        last_login
    FROM app_users
    ORDER BY last_login DESC
""", conn)

df["created_at"] = pd.to_datetime(df["created_at"]).dt.strftime("%b %d, %Y, %I:%M %p")
df["last_login"] = pd.to_datetime(df["last_login"]).dt.strftime("%b %d, %Y, %I:%M %p")

print("\n================ USERS ================\n")
print(df.to_string(index=False))

queries = pd.read_sql_query("""
    SELECT
        id,
        user_id,
        user_email,
        question,
        status,
        prompt_tokens,
        completion_tokens,
        total_tokens,
        cost_usd,
        latency_ms,
        retry_count,
        created_at
    FROM user_queries
    ORDER BY created_at DESC
""", conn)

print("\n============= USER QUERIES =============\n")

if queries.empty:
    print("No queries recorded yet.")
else:
    print(queries.to_string(index=False))


conn.close()
