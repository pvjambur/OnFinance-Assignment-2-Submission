import time
import sys
import os
from agents.base.agent import BaseAgent

# Add root to python path to allow importing base agent if running directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

class AgentA(BaseAgent):
    def run(self):
        self.register()
        print(f"Agent {self.name} starting loop...")
        while self.running:
            # Simulate work
            print("Research Agent doing research...")
            time.sleep(5)

if __name__ == "__main__":
    agent = AgentA("agent-a")
    agent.run()
