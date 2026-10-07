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

def question_check_node(state: AgentState) -> Dict[str, Any]:
    """
    Determines whether the user's question can actually be answered
    using the available database schema.
    """

    llm = get_llm()

    prompt = f"""
You are a strict database question analyzer.

Your job is to determine whether the user's question can be answered
USING ONLY the provided SQLite database schema.

You MUST NOT assume information that is not represented in the schema.

Database Schema:
{state['schema']}

User Question:
{state['question']}

Rules:

1. The question must be answerable using information contained in the
   database schema or relationships explicitly represented by the tables.

2. Do NOT treat unrelated database values as an answer.

3. Do NOT reinterpret the user's question into a different question.

4. Personal, external, or missing information must be rejected.

5.  Return NOT_ANSWERABLE if the question asks about:
   - personal information not present in the database
   - people, objects, facts, or concepts outside the database
   - information that cannot be derived from the available columns
   - general knowledge
   - conversational/personal questions
   - anything where generating SQL would require inventing data

6. A question is answerable only if there is a reasonable mapping between
   the requested information and the database schema.

7. Be conservative.
   If there is doubt, mark the question as NOT ANSWERABLE.

Return ONLY valid JSON:

{{
    "is_answerable": true,
    "reason": "short explanation"
}}
"""
    res = llm.invoke([HumanMessage(content=prompt)])
    txt = parse_text(res.content).strip()
    txt = re.sub(r"^```(?:json)?\s*","",txt,flags=re.IGNORECASE)
    txt = re.sub(r"\s*```$", "", txt)

    usage = extract_usage(res)

    try:
        obj = json.loads(txt)
        is_answerable = bool(obj.get("is_answerable", False))
        answerability_reason = obj.get(
            "reason",
            "The question cannot be answered from the database."
        )

        if not is_answerable:
            return {
                "is_answerable": False,
                "answerability_reason": answerability_reason,
                "is_valid": False,
                "error_message": (
                    "This question cannot be answered using the available "
                    "database information."
                ),
                **add_usage(state, usage)
            }

        return {
            "is_answerable": True,
            "answerability_reason": answerability_reason,
            "is_valid": False,
            "error_message": None,
            **add_usage(state, usage)
        }

    except Exception:
        return {
            "is_answerable": False,
            "answerability_reason": (
                "The question could not be verified against the database schema."
            ),
            "is_valid": False,
            "error_message": (
                "This question cannot be safely answered using the available "
                "database information."
            ),
            **add_usage(state, usage)
        }

# SQL Generator Node
def gen_node(state: AgentState) -> Dict[str, Any]:
    llm = get_llm()
    prompt = f"""
You are an expert SQL Data Analyst writing queries for SQLite.

The question has already been checked and determined to be answerable
using the database schema.

Your job is to write a single clean SQLite SELECT query that answers
the user's question EXACTLY.

### DATABASE SCHEMA

{state['schema']}

### USER QUESTION

{state['question']}

### STRICT RULES

1. Use ONLY tables and columns explicitly present in the schema.
2. NEVER invent:
   - tables
   - columns
   - people
   - relationships
   - facts
   - values
3. The SQL must directly answer the user's question.
4. Do NOT reinterpret an unrelated question as a database question.
5. Do NOT use a generic column to answer an unrelated question.
6. If the question cannot be answered from this database, return exactly:
NOT_ANSWERABLE
7. Otherwise return ONE read-only SQLite SELECT query.
8. Never return INSERT, UPDATE, DELETE, DROP, ALTER, CREATE,
   TRUNCATE, PRAGMA, ATTACH, or other write/admin statements.
9. Return ONLY SQL or NOT_ANSWERABLE.
10. Do not use hardcoded values as a substitute for missing information.
11. Do NOT invent relationships.
12. Do NOT answer a different question just because some database
   information looks vaguely related.
13. If the question asks for a concept that is not represented in the
   schema, it must not be mapped to an unrelated column.
"""
    res = llm.invoke([HumanMessage(content=prompt)])

    sql = clean_sql(res.content)
    usage = extract_usage(res)

    if sql.strip().upper() == "NOT_ANSWERABLE":
        return {
            "sql_query": "",
            "is_answerable": False,
            "answerability_reason": "The question could not be mapped to the database schema.",
            "is_valid": False,
            "error_message": (
                "This question cannot be answered using the available "
                "database information."
            ),
            **add_usage(state, usage)
        }
    
    return {
        "sql_query": sql,
        "is_valid": False,
        "error_message": None,
        **add_usage(state, usage)
    }

# SQL Validator Node
def val_node(state: AgentState) -> Dict[str, Any]:
    sql = state["sql_query"].strip()

    if not sql:
        return {
            "is_valid": False,
            "error_message": "Empty SQL query."
        }
    normalized = sql.upper().strip()
    normalized = normalized.rstrip(";").strip()

    if not (
        normalized.startswith("SELECT")
        or normalized.startswith("WITH")
    ):
        return {
            "is_valid": False,
            "error_message": "Security Error: Only read-only SELECT queries are allowed."
        }

    bad_kw = [
        "DROP",
        "DELETE",
        "UPDATE",
        "INSERT",
        "ALTER",
        "TRUNCATE",
        "CREATE",
        "REPLACE",
        "ATTACH",
        "DETACH",
        "PRAGMA",
        "REINDEX",
        "VACUUM"
    ]

    if any(re.search(rf"\b{k}\b", normalized) for k in bad_kw):
        return {
            "is_valid": False,
            "error_message":
                "Security Error: Non-read-only SQL operation detected."
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
    hist = list(state.get("repair_history", []))
    
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
        row_count = len(df)
        return {
            "df_result": df.to_dict(orient="records"),
            "columns": list(df.columns) if row_count > 0 else [],
            "row_count": row_count,
            "is_valid": True,
            "error_message": None
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
