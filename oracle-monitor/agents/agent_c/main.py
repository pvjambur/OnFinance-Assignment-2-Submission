import time
import sys
import os
from agents.base.agent import BaseAgent

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

class AgentC(BaseAgent):
    def run(self):
        self.register()
        print(f"Agent {self.name} starting loop...")
        while self.running:
            # Simulate work
            print("Writing Agent drafting report...")
            time.sleep(5)

if __name__ == "__main__":
    agent = AgentC("agent-c")
    agent.run()
