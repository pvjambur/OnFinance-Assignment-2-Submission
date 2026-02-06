import os
import sys
import shutil

# Template for the agent code
AGENT_TEMPLATE = """import time
import sys
import os
from agents.base.agent import BaseAgent

# Add root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

class {class_name}(BaseAgent):
    def run(self):
        self.register()
        print(f"Agent {{self.name}} starting loop...")
        while self.running:
            # Main logic loop
            # Check Kafka tasks here via self.listen_for_tasks() (running in bg)
            time.sleep(5)

if __name__ == "__main__":
    agent = {class_name}("{agent_kebab}")
    agent.run()
"""

# Template for K8s deployment
DEPLOYMENT_TEMPLATE = """apiVersion: apps/v1
kind: Deployment
metadata:
  name: {agent_kebab}-deployment
  namespace: oracle-monitor
  labels:
    app: {agent_kebab}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {agent_kebab}
  template:
    metadata:
      labels:
        app: {agent_kebab}
    spec:
      containers:
      - name: {agent_kebab}
        image: oracle-monitor-agent:latest
        command: ["python", "-m", "agents.{agent_snake}.main"]
        envFrom:
        - configMapRef:
            name: agent-config
        - secretRef:
            name: api-keys-secret
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
"""

def to_camel_case(snake_str):
    return "".join(x.capitalize() for x in snake_str.lower().split("_"))

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/create_agent.py <agent_name_snake_case>")
        print("Example: python scripts/create_agent.py risk_manager")
        sys.exit(1)

    agent_name = sys.argv[1]
    agent_kebab = agent_name.replace("_", "-")
    class_name = to_camel_case(agent_name) + "Agent"
    
    # Paths
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    agent_dir = os.path.join(root_dir, "agents", agent_name)
    deployment_path = os.path.join(root_dir, "infrastructure", "kubernetes", "deployments", f"{agent_kebab}-deployment.yaml")
    
    # 1. Create Agent Directory
    if os.path.exists(agent_dir):
        print(f"Error: Agent directory {agent_dir} already exists.")
        sys.exit(1)
    
    os.makedirs(agent_dir)
    print(f"Created directory: {agent_dir}")
    
    # 2. Create __init__.py
    with open(os.path.join(agent_dir, "__init__.py"), "w") as f:
        pass
        
    # 3. Create main.py
    with open(os.path.join(agent_dir, "main.py"), "w") as f:
        f.write(AGENT_TEMPLATE.format(class_name=class_name, agent_kebab=agent_kebab))
    print(f"Created agent code: {os.path.join(agent_dir, 'main.py')}")

    # 4. Create K8s Deployment
    with open(deployment_path, "w") as f:
        f.write(DEPLOYMENT_TEMPLATE.format(agent_kebab=agent_kebab, agent_snake=agent_name))
    print(f"Created deployment: {deployment_path}")

    print("\nSuccess! To deploy the new agent:")
    print(f"1. Rebuild image: docker build -t oracle-monitor-agent:latest -f agents/Dockerfile.agent .")
    print(f"2. Apply K8s: kubectl apply -f infrastructure/kubernetes/deployments/{agent_kebab}-deployment.yaml")

if __name__ == "__main__":
    main()
