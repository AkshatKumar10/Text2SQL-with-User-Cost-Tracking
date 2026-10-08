from typing import TypedDict, Optional, List, Dict, Any
import pandas as pd

class AgentState(TypedDict):
    user_id: Optional[int]
    question: str
    schema: str
    is_answerable: bool
    answerability_reason: str
    sql_query: str
    is_valid: bool
    error_message: Optional[str]
    retry_count: int
    max_retries: int
    df_result: Optional[List[Dict[str, Any]]]
    columns: Optional[List[str]]
    row_count: int
    analyst_summary: str
    chart_type: str
    chart_config: Optional[Dict[str, Any]]
    repair_history: List[Dict[str, str]]
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
