from langgraph.graph import StateGraph, END
from .state import AgentState
from .nodes import (
    question_check_node,
    gen_node,
    val_node,
    repair_node,
    exec_node,
    analyst_node
)

def check_question(state: AgentState) -> str:
    if state.get("is_answerable", False):
        return "generate"

    return END

def check_generated(state: AgentState) -> str:
    """Stop if the generator declined (NOT_ANSWERABLE)."""
    if (state.get("sql_query") or "").strip():
        return "validate"
    return END

def check_next(state: AgentState) -> str:
    """Conditional routing based on validation."""
    if state.get("is_valid", False):
        return "execute"
    
    tries = state.get("retry_count", 0)
    max_tries = state.get("max_retries", 3)
    
    if tries < max_tries:
        return "repair"
    return END

def check_execution(state: AgentState) -> str:
    """If the query passed validation but failed at runtime, repair it
    (while retries remain)."""
    if not state.get("error_message"):
        return "analyst"
 
    tries = state.get("retry_count", 0)
    max_tries = state.get("max_retries", 3)
 
    if tries < max_tries:
        return "repair"
    return END

def build_workflow():
    """Builds LangGraph flow."""
    flow = StateGraph(AgentState)
    
    flow.add_node("question_check", question_check_node)
    flow.add_node("generator", gen_node)
    flow.add_node("validator", val_node)
    flow.add_node("repair", repair_node)
    flow.add_node("execute", exec_node)
    flow.add_node("analyst", analyst_node)
    
    flow.set_entry_point("question_check")
    flow.add_conditional_edges(
        "question_check",
        check_question,
        {
            "generate": "generator",
            END: END
        }
    )
    flow.add_conditional_edges(
        "generator",
        check_generated,
        {
            "validate": "validator",
            END: END
        }
    )
    
    flow.add_conditional_edges(
        "validator",
        check_next,
        {
            "execute": "execute",
            "repair": "repair",
            END: END
        }
    )
    flow.add_edge("repair", "validator")
    flow.add_conditional_edges(
        "execute",
        check_execution,
        {
            "repair": "repair",
            "analyst": "analyst",
            END: END
        }
    )
    
    flow.add_edge("analyst", END)
    
    return flow.compile()
