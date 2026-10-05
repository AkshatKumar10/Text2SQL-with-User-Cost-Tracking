import os
import json
import re
import sqlite3
import pandas as pd
from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from .state import AgentState
from database import DB_PATH, run_sql

# def get_llm():
#     return ChatGoogleGenerativeAI(
#         model="gemini-3.6-flash",
#         temperature=0.0,
#         google_api_key=os.getenv("GOOGLE_API_KEY")  # or GOOGLE_API_KEY
#     )
def get_llm():
    return ChatGroq(
        model="openai/gpt-oss-120b",
        temperature=0.0,
        groq_api_key=os.getenv("GROQ_API_KEY")
    )

def parse_text(val: Any) -> str:
    """Extracts plain text string."""
    if isinstance(val, str):
        return val
    elif isinstance(val, list):
        res = []
        for x in val:
            if isinstance(x, str):
                res.append(x)
            elif isinstance(x, dict) and "text" in x:
                res.append(x["text"])
            elif hasattr(x, "text"):
                res.append(x.text)
            else:
                res.append(str(x))
        return "".join(res)
    return str(val)

def clean_sql(text: Any) -> str:
    """Strips markdown from SQL."""
    raw = parse_text(text).strip()
    raw = re.sub(r"^```(?:sql)?\s*", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"\s*```$", "", raw.strip())
    return raw.strip()

def extract_usage(response) -> Dict[str, int]:
    """Safely extract token usage from LangChain response."""
    usage = getattr(response, "usage_metadata", None) or {}
    
    if not usage and hasattr(response, "response_metadata"):
        usage = response.response_metadata.get("usage", {}) or {}

    return {
        "prompt_tokens": int(usage.get("input_tokens", 0) or usage.get("prompt_tokens", 0) or 0),
        "completion_tokens": int(usage.get("output_tokens", 0) or usage.get("completion_tokens", 0) or 0),
        "total_tokens": int(usage.get("total_tokens", 0) or 0),
    }

def add_usage(state: AgentState, usage: Dict[str, int]) -> Dict[str, int]:
    """Accumulate tokens into state."""
    return {
        "prompt_tokens": state.get("prompt_tokens", 0) + usage["prompt_tokens"],
        "completion_tokens": state.get("completion_tokens", 0) + usage["completion_tokens"],
        "total_tokens": state.get("total_tokens", 0) + usage["total_tokens"],
    }

# SQL Generator Node
def gen_node(state: AgentState) -> Dict[str, Any]:
    llm = get_llm()
    prompt = f"""You are an expert SQL Data Analyst writing queries for SQLite.
Given the SQLite Database Schema below, write a single clean SQLite SELECT query that answers the user's question.

### Rules:
1. Return ONLY the raw SQL query. Do not provide explanations or markdown.
2. Use ONLY the table and column names specified in the schema.
3. Use appropriate JOINs and aggregate functions where necessary.
4. Only generate read-only SELECT queries.

Database Schema:
{state['schema']}

User Question: {state['question']}
"""
    res = llm.invoke([HumanMessage(content=prompt)])

    sql = clean_sql(res.content)
    usage = extract_usage(res)
    
    return {
        "sql_query": sql,
        "is_valid": False,
        "error_message": None,
        **add_usage(state, usage)
    }

# SQL Validator Node
def val_node(state: AgentState) -> Dict[str, Any]:
    sql = state["sql_query"]
    
    bad_kw = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE"]
    tokens = sql.upper().split()
    if any(k in tokens for k in bad_kw):
        return {
            "is_valid": False,
            "error_message": "Security Error: Non-SELECT queries (DROP, DELETE, UPDATE, etc.) are forbidden."
        }
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute(f"EXPLAIN QUERY PLAN {sql}")
        conn.close()
        return {
            "is_valid": True,
            "error_message": None
        }
    except Exception as e:
        return {
            "is_valid": False,
            "error_message": str(e)
        }

# SQL Repair Node
def repair_node(state: AgentState) -> Dict[str, Any]:
    llm = get_llm()
    tries = state.get("retry_count", 0) + 1
    hist = state.get("repair_history", [])
    
    hist.append({
        "attempt": tries,
        "failed_sql": state["sql_query"],
        "error": state["error_message"]
    })
    
    prompt = f"""You are an expert SQL Debugging Agent. The previous SQL query failed validation on SQLite.

### Database Schema:
{state['schema']}

### User's Original Question:
{state['question']}

### Failed SQL:
{state['sql_query']}

### SQLite Error Message:
{state['error_message']}

### Instructions:
1. Carefully read the error message (e.g. non-existent column, syntax mismatch).
2. Fix the query using ONLY tables and columns from the schema.
3. Return ONLY the corrected raw SQL query. No explanation, no markdown.
"""
    res = llm.invoke([HumanMessage(content=prompt)])
    
    fixed_sql = clean_sql(res.content)
    usage = extract_usage(res)
    
    return {
        "sql_query": fixed_sql,
        "retry_count": tries,
        "repair_history": hist,
        "is_valid": False,
        "error_message": None,
        **add_usage(state, usage)
    }

# SQL Execution Node
def exec_node(state: AgentState) -> Dict[str, Any]:
    try:
        df = run_sql(state["sql_query"])
        return {
            "df_result": df.to_dict(orient="records"),
            "columns": list(df.columns),
            "row_count": len(df)
        }
    except Exception as e:
        return {
            "df_result": [],
            "columns": [],
            "row_count": 0,
            "error_message": f"Execution error: {str(e)}"
        }

# Agent Analyst Node
def analyst_node(state: AgentState) -> Dict[str, Any]:
    llm = get_llm()
    recs = state.get("df_result", [])
    cols = state.get("columns", [])
    
    if not recs:
        return {
            "analyst_summary": "The query executed successfully but returned 0 rows.",
            "chart_type": "none",
            "chart_config": {}
        }
    
    sample = json.dumps(recs[:10], indent=2)
    
    prompt = f"""You are a senior Business Intelligence Data Analyst and Visualization Specialist.
Analyze the following query results and decide on the single best visualization.

User Question: {state['question']}
SQL Query: {state['sql_query']}
Columns: {cols}
Result Sample (up to 10 rows):
{sample}

Provide your answer in strict JSON format matching this schema:
{{
  "summary": "2-3 sentence concise business summary of what the data shows",
  "chart_type": "bar | line | pie | scatter | kpi | table",
  "chart_config": {{
    "title": "Chart Title",
    "x": "column_for_x_axis",
    "y": "column_for_y_axis",
    "color": "optional_column_for_hue",
    "kpi_value_column": "optional_column_for_single_metric"
  }}
}}

Chart selection guidelines:
- If categorical vs numerical metric (e.g. Sales by Category, Top Customers): "bar"
- If chronological/trend over dates/months: "line"
- If parts of a whole (up to 6 categories): "pie"
- If correlation between two continuous numbers: "scatter"
- If exactly 1 row with 1 aggregate value: "kpi"
- If complex multi-dimensional table not easily visualizable: "table"

Return ONLY valid JSON.
"""
    res = llm.invoke([HumanMessage(content=prompt)])
    
    txt = parse_text(res.content).strip()
    txt = re.sub(r"^```(?:json)?\s*", "", txt, flags=re.IGNORECASE)
    txt = re.sub(r"\s*```$", "", txt)
    usage = extract_usage(res)
    
    try:
        obj = json.loads(txt)
        return {
            "analyst_summary": obj.get("summary", "Analysis completed."),
            "chart_type": obj.get("chart_type", "table"),
            "chart_config": obj.get("chart_config", {}),
            **add_usage(state, usage)
        }
    except Exception:
        return {
            "analyst_summary": "Query executed and returned data.",
            "chart_type": "table",
            "chart_config": {},
            **add_usage(state, usage)
        }
