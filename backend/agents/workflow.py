from langgraph.graph import StateGraph, END
from .state import AgentState
from .nodes import (
    gen_node,
    val_node,
    repair_node,
    exec_node,
    analyst_node
)

def check_next(state: AgentState) -> str:
    """Conditional routing based on validation."""
    if state.get("is_valid", False):
        return "execute"
    
    tries = state.get("retry_count", 0)
    max_tries = state.get("max_retries", 3)
    
    if tries < max_tries:
        return "repair"
    return END

def build_workflow():
    """Builds LangGraph flow."""
    flow = StateGraph(AgentState)
    
    flow.add_node("generator", gen_node)
    flow.add_node("validator", val_node)
    flow.add_node("repair", repair_node)
    flow.add_node("execute", exec_node)
    flow.add_node("analyst", analyst_node)
    
    flow.set_entry_point("generator")
    flow.add_edge("generator", "validator")
    
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
    flow.add_edge("execute", "analyst")
    flow.add_edge("analyst", END)
    
    return flow.compile()
