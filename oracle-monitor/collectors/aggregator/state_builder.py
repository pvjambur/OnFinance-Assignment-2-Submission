from datetime import datetime, timezone
import uuid
from typing import Dict, Any

# Collectors
from collectors.k8s_collector.collector import K8sCollector
from collectors.litellm_collector.collector import LiteLLMCollector
from collectors.queue_collector.kafka_collector import QueueCollector
from collectors.agent_collector.collector import AgentCollector
from collectors.aggregator.validator import Validator

class StateBuilder:
    def __init__(self, schema_path: str):
        self.k8s = K8sCollector()
        self.litellm = LiteLLMCollector()
        self.queue = QueueCollector()
        self.agent = AgentCollector()
        self.validator = Validator(schema_path)

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
        if not self.validator.validate(snapshot):
            print("Warning: Generated snapshot failed validation!")
            # In production, we might store it anyway with a flag, or discard it.
        
        return snapshot
