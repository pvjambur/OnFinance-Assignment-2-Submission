from typing import Dict, Any, List
import requests
from collectors.base.collector import Collector
from collectors.base.config import Config

class AgentCollector(Collector):
    def __init__(self):
        self.api_url = Config.AGENT_API_URL

    def collect(self) -> List[Dict[str, Any]]:
        try:
            response = requests.get(f"{self.api_url}/agents/status", timeout=5)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error collecting agent status: {e}")
            return []
