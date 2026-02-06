# Oracle Monitor: Complete Run Instructions

**Follow these steps exactly to restart from the beginning.**

## 0. Developer Setup (Python Backend)
If you are running Python scripts locally (outside Kubernetes), set up your environment:
```powershell
# Create venv
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## 1. Clean Slate (Reset)
Run this to clear any broken state:
```powershell
# Stop and delete Minikube to force a fresh start
minikube delete

# Start Minikube with the Docker driver (Bypasses VirtualBox issues)
minikube start --driver=docker
```

## 2. Setup Kubernetes Environment
```powershell
# Create the namespace first
minikube kubectl -- apply -f infrastructure/kubernetes/namespace.yaml

# Apply the Secrets (Contains your API Key and Supabase Key)
minikube kubectl -- apply -f infrastructure/kubernetes/secrets/api-keys-secret.yaml
```

## 3. Build Images (Crucial Step)
This builds the code *inside* Minikube so Kubernetes can see it.
```powershell
# Build the Agent & Collector Image
minikube image build -t oracle-monitor-agent:latest -f agents/Dockerfile.agent .

# Build the API Image
minikube image build -t oracle-monitor-api:latest -f api/Dockerfile .
```

## 4. Deploy System
```powershell
# Deploy all services (API, Kafka, LiteLLM)
minikube kubectl -- apply -f infrastructure/kubernetes/services/

# Deploy all applications (Agents, Collector)
minikube kubectl -- apply -f infrastructure/kubernetes/deployments/
```

## 5. Verify It's Running
```powershell
# Check if pods are green/running
minikube kubectl -- get pods -n oracle-monitor

# OPTIONAL: Check Collector logs to confirm it's talking to Supabase
minikube kubectl -- logs -l app=k8s-collector -n oracle-monitor
```

## 6. Start the UI
Open a new terminal for this:
```bash
cd frontend
# (Optional) Verify .env contains your Supabase keys
# cp .env.example .env

npm install
npm run dev
```
> Go to **http://localhost:5173**. You should see the glass dashboard.

---

## 🛑 Troubleshooting
- **"ImagePullBackOff"**: You skipped Step 3. Run the `minikube image build` commands again.
- **"Waiting for system snapshot..."**: 
    1. Did you run the SQL in Supabase Dashboard? (Create Table `system_snapshots`)
    2. Did you put the `SUPABASE_SERVICE_ROLE_KEY` in `api-keys-secret.yaml`?
