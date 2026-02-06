from deepdiff import DeepDiff
from typing import Dict, Any

def get_state_diff(state1: Dict[str, Any], state2: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate the semantic difference between two states."""
    
    # We ignore timestamp and ID for the diff
    s1_clean = {k: v for k, v in state1.items() if k not in ["id", "timestamp"]}
    s2_clean = {k: v for k, v in state2.items() if k not in ["id", "timestamp"]}
    
    diff = DeepDiff(s1_clean, s2_clean, ignore_order=True)
    return diff.to_dict()
