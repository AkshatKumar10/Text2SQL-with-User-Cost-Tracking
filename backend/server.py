import os
import time
import io
import re
import sqlite3
import uvicorn
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from dotenv import load_dotenv

import jwt
import requests
from database import (
    get_schema, init_db, run_sql, DB_PATH, APP_DB_PATH, import_df, clean_table,
    ensure_meta_tables, get_or_create_user, get_user_by_id, log_user_query, get_user_dashboard_stats
)
from agents.workflow import build_workflow
from langfuse.langchain import CallbackHandler
from langfuse import Langfuse

load_dotenv()

app = FastAPI(title="Text2SQL with User Cost Tracking", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET", "text2sql_user_cost_tracking_secret_2026")
JWT_ALGORITHM = "HS256"

def get_langfuse_client():
    sk = os.getenv("LANGFUSE_SECRET_KEY")
    pk = os.getenv("LANGFUSE_PUBLIC_KEY")
    host = os.getenv("LANGFUSE_HOST", "https://us.cloud.langfuse.com")
    if sk and pk and Langfuse:
        try:
            return Langfuse(public_key=pk, secret_key=sk, host=host)
        except Exception as e:
            print(f"Langfuse client error: {e}")
            return None
    return None

class QueryReq(BaseModel):
    question: str
    user_id: Optional[int] = None
    guest_mode: Optional[bool] = False

class SqlReq(BaseModel):
    sql: str

class GoogleAuthReq(BaseModel):
    credential: Optional[str] = None
    id_token: Optional[str] = None

@app.get("/api/health")
def health():
    llm = bool(os.getenv("GROQ_API_KEY"))
    lf = bool(os.getenv("LANGFUSE_PUBLIC_KEY") and os.getenv("LANGFUSE_SECRET_KEY"))
    google_client = bool(os.getenv("GOOGLE_CLIENT_ID"))
    return {
        "status": "healthy",
        "llm_connected": llm,
        "langfuse_active": lf,
        "google_auth_configured": google_client,
        "db_exists": os.path.exists(DB_PATH)
    }

@app.post("/api/auth/google")
def google_auth(req: GoogleAuthReq):
    token_val = req.credential
    if not token_val:
        raise HTTPException(status_code=400, detail="Missing Google token")

    decoded = None
    try:
        resp = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={token_val}",
            timeout=5
        )

        if resp.status_code != 200:
            raise HTTPException(
                status_code=401,
                detail="Invalid Google token"
            )

        decoded = resp.json()

    except requests.RequestException:
        raise HTTPException(
            status_code=401,
            detail="Could not verify Google token"
        )


    google_id = decoded.get("sub")
    email = decoded.get("email", "")
    name = decoded.get("name", email.split("@")[0] if email else "User")
    picture = decoded.get("picture", "")

    if not google_id:
        raise HTTPException(status_code=400, detail="Google token payload missing subject ID (sub)")

    user = get_or_create_user(google_id=google_id, email=email, name=name, picture=picture)

    payload = {
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "exp": int(time.time()) + (86400 * 30) # 30 days
    }
    session_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return {
        "status": "success",
        "token": session_token,
        "user": user
    }

@app.get("/api/auth/me")
def get_current_user(token: Optional[str] = None):
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = get_user_by_id(payload["user_id"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"status": "success", "user": user}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@app.get("/api/user/dashboard")
def get_user_dashboard(user_id: int):
    stats = get_user_dashboard_stats(user_id)
    if not stats:
        raise HTTPException(status_code=404, detail="User dashboard data not found")
    return {"status": "success", **stats}

@app.get("/api/schema")
def fetch_schema():
    raw = get_schema()
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
    SELECT name, sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
      AND name NOT IN ('app_users', 'user_queries');
""")

    meta = cur.fetchall()
    
    tables = []
    for tbl, ddl in meta:
        cur.execute(f"PRAGMA table_info(`{tbl}`);")
        cols = [{"cid": r[0], "name": r[1], "type": r[2], "notnull": bool(r[3]), "pk": bool(r[5])} for r in cur.fetchall()]
        
        df = pd.read_sql_query(f"SELECT * FROM `{tbl}` LIMIT 5;", conn)
        rows = df.to_dict(orient="records")
        
        cur.execute(f"SELECT count(*) FROM `{tbl}`")
        count = cur.fetchone()[0]
        
        tables.append({
            "name": tbl,
            "ddl": ddl,
            "columns": cols,
            "sample_rows": rows,
            "total_rows": count
        })
    conn.close()
    
    return {
        "raw_schema": raw,
        "tables": tables
    }

@app.post("/api/upload")
async def upload(
    file: UploadFile = File(...),
    custom_table_name: Optional[str] = Form(None)
):
    fname = file.filename or "dataset.csv"
    ext = os.path.splitext(fname)[1].lower()
    
    if ext not in [".csv", ".xlsx", ".xls", ".json"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Upload .csv, .xlsx, or .json file."
        )

    try:
        data = await file.read()
        
        if ext == ".csv":
            try:
                df = pd.read_csv(io.BytesIO(data))
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(data), encoding="latin-1")
        elif ext in [".xlsx", ".xls"]:
            df = pd.read_excel(io.BytesIO(data))
        elif ext == ".json":
            df = pd.read_json(io.BytesIO(data))
        else:
            raise HTTPException(status_code=400, detail="Unsupported format.")
        
        if df.empty:
            raise HTTPException(status_code=400, detail="File contains no data.")

        raw_name = custom_table_name.strip() if custom_table_name and custom_table_name.strip() else os.path.splitext(fname)[0]
        tbl = clean_table(raw_name)

        res = import_df(df, tbl, replace=True)
        return {
            "status": "success",
            "message": f"Created table '{res['table_name']}' with {res['rows_imported']} rows.",
            "table_name": res["table_name"],
            "rows_imported": res["rows_imported"],
            "columns": res["columns"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File process error: {str(e)}")

@app.post("/api/reset-db")
def reset_db():
    try:
        init_db()
        return {"status": "success", "message": "Database reset state successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/execute-sql")
def exec_sql(req: SqlReq):
    try:
        df = run_sql(req.sql)
        recs = df.to_dict(orient="records")
        cols = list(df.columns)
        return {
            "columns": cols,
            "records": recs,
            "row_count": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/query")
def run_query(req: QueryReq):
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=400, detail="GROQ_API_KEY missing in .env")
        
    schema_txt = get_schema()
    flow = build_workflow()
    
    init_state = {
        "question": req.question.strip(),
        "schema": schema_txt,
        "sql_query": "",
        "is_valid": False,
        "error_message": None,
        "retry_count": 0,
        "max_retries": 3,
        "df_result": [],
        "columns": [],
        "row_count": 0,
        "analyst_summary": "",
        "chart_type": "table",
        "chart_config": {},
        "repair_history": [],
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "total_tokens": 0
    }
    
    is_authenticated = bool(req.user_id and not req.guest_mode)
    cb = CallbackHandler() if (is_authenticated and CallbackHandler and ...) else None
    
    cfg = {}
    if cb:
        cfg["callbacks"] = [cb]
        cfg["metadata"] = {
            "langfuse_user_id": f"user_{req.user_id}",
            "langfuse_session_id": f"session_u{req.user_id}_{int(time.time())}",
            "langfuse_tags": ["text2sql", f"user_{req.user_id}"],
        }
        cfg["tags"] = ["text2sql", f"user_{req.user_id}"]
        
    t0 = time.time()
    try:
        res = flow.invoke(init_state, config=cfg)
        dt_seconds = round(time.time() - t0, 2)
        latency_ms = int(dt_seconds * 1000)
        
        p_tokens = res.get("prompt_tokens", 0)
        c_tokens = res.get("completion_tokens", 0)
        total_t = res.get("total_tokens", 0)
        
        INPUT_PRICE_PER_1K = 0.00075    # $0.75 per 1M input tokens
        OUTPUT_PRICE_PER_1K = 0.00375   # $3.75 per 1M output tokens

        cost_usd = round(
            (p_tokens / 1000) * INPUT_PRICE_PER_1K +
            (c_tokens / 1000) * OUTPUT_PRICE_PER_1K,
            6
        )

        tokens_info = {
            "prompt_tokens": p_tokens,
            "completion_tokens": c_tokens,
            "total_tokens": total_t,
            "cost_usd": cost_usd
        }

        real_trace_id=""
        if is_authenticated and cb:
            real_trace_id = getattr(cb, "last_trace_id", None) or ""
            if hasattr(cb, "flush"):
                try:
                    cb.flush()
                except Exception:
                    pass

            user_data = get_user_by_id(req.user_id)
            user_email = user_data["email"] if user_data else "unknown"
            retries = res.get("retry_count", 0)
            status_str = "repaired" if retries > 0 and res.get("is_valid") else ("success" if res.get("is_valid") else "error")
            
            log_user_query(
                user_id=req.user_id,
                user_email=user_email,
                question=req.question,
                sql_query=res.get("sql_query", ""),
                status=status_str,
                prompt_tokens=p_tokens,
                completion_tokens=c_tokens,
                total_tokens=total_t,
                cost_usd=cost_usd,
                latency_ms=latency_ms,
                retry_count=retries,
                langfuse_trace_id=real_trace_id
            )
        
        return {
            "question": req.question,
            "latency": dt_seconds,
            "sql_query": res.get("sql_query", ""),
            "is_valid": res.get("is_valid", False),
            "retry_count": res.get("retry_count", 0),
            "repair_history": res.get("repair_history", []),
            "df_result": res.get("df_result", []),
            "columns": res.get("columns", []),
            "row_count": res.get("row_count", 0),
            "analyst_summary": res.get("analyst_summary", ""),
            "chart_type": res.get("chart_type", "table"),
            "chart_config": res.get("chart_config", {}),
            "error_message": res.get("error_message"),
            "guest_mode": req.guest_mode or not is_authenticated,
            "tokens": tokens_info,
            "trace_id": real_trace_id   
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
