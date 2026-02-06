from typing import Dict, Any, List
import requests
from collectors.base.collector import Collector
from collectors.base.config import Config

class AgentCollector(Collector):
    def __init__(self):
        self.api_url = Config.AGENT_API_URL

    def collect(self) -> List[Dict[str, Any]]:
        # Call the Agent orchestration API to get status of all agents
        # requests.get(f"{self.api_url}/agents/status")
        
        # Mock data
        return [
            {
                "name": "agent-a",
                "deployment_name": "agent-a-deployment",
                "activity": {
                    "active_task_ids": [
                        {"id": "task-123", "status": "running", "started_on": "2024-02-06T12:00:00Z", "waiting_since_mins": 0}
                    ]
                }
            },
            {
                "name": "agent-b",
                "deployment_name": "agent-b-deployment",
                "activity": {
                    "active_task_ids": []
                }
            }
        ]
