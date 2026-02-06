import time
import requests
import os
import logging
from abc import ABC, abstractmethod

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(self, name: str, api_url: str = "http://api:8000"):
        self.name = name
        self.deployment_name = f"{name}-deployment"
        self.api_url = os.getenv("AGENT_API_URL", api_url)
        self.running = True

    def register(self):
        """Register the agent with the orchestration API."""
        try:
            data = {
                "name": self.name,
                "deployment_name": self.deployment_name,
                "activity": {"active_task_ids": []}
            }
            response = requests.post(f"{self.api_url}/agents/register", json=data)
            response.raise_for_status()
            logger.info(f"Agent {self.name} registered successfully.")
        except Exception as e:
            logger.error(f"Failed to register agent: {e}")

    @abstractmethod
    def run(self):
        """Main agent loop."""
        pass
    
    def report_status(self, task_id: str = None, status: str = "idle"):
        # Implementation to report status to API
        pass
