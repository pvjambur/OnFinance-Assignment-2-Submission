import time
import sys
import os
from agents.base.agent import BaseAgent

# Add root to python path to allow importing base agent if running directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

class ResearchAgent(BaseAgent):
    def run(self):
        self.register()
        print(f"Agent {self.name} starting loop...")
        while self.running:
            # Simulate real research telemetry
            self.publish_log("Scanning system metrics for anomalies...", level="info")
            time.sleep(2)
            self.publish_log("Analyzing pod health across oracle-monitor namespace", level="info")
            time.sleep(2)
            self.publish_log("Potential resource bottleneck detected in queue sub-system", level="warning")
            time.sleep(5)

if __name__ == "__main__":
    agent = ResearchAgent("research-agent")
    agent.run()
