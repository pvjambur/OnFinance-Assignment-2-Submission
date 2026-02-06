from datetime import datetime, timezone
import uuid
from typing import Dict, Any

# Collectors
from collectors.k8s_collector.collector import K8sCollector
from collectors.litellm_collector.collector import LiteLLMCollector
from collectors.queue_collector.kafka_collector import QueueCollector
from collectors.agent_collector.collector import AgentCollector
from collectors.aggregator.validator import validate_state

class StateBuilder:
    def __init__(self):
        self.k8s = K8sCollector()
        self.litellm = LiteLLMCollector()
        self.queue = QueueCollector()
        self.agent = AgentCollector()

    def build_snapshot(self) -> Dict[str, Any]:
        snapshot_id = f"snapshot-{uuid.uuid4()}"
        timestamp = datetime.now(timezone.utc).isoformat()

        # Collect data in parallel (conceptually, distinct calls here)
        workload_state = self.k8s.collect()
        litellm_state = self.litellm.collect()
        queue_state = self.queue.collect()
        agent_state = self.agent.collect()

        snapshot = {
            "id": snapshot_id,
            "timestamp": timestamp,
            "agents": agent_state,
            "workload": workload_state,
            "queues": queue_state,
            "litellm": litellm_state
        }

        # Validate
        if not validate_state(snapshot):
            print("Warning: Generated snapshot failed validation!")
            # In production, we might store it anyway with a flag, or discard it.
            # For now, we mimic the user guide's raising behavior or just return it with warning
            # The user guide raised ValueError, but here we just warn as per previous code style?
            # User guide says: raise ValueError("Built state doesn't match schema!")
            # I will follow the user guide.
            raise ValueError("Built state doesn't match schema!")
        
        return snapshot
