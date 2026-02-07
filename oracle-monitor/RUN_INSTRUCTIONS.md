# Oracle Monitor - Run Instructions

## Complete System Setup Guide

### Prerequisites
- Docker Desktop running
- Minikube installed and running
- Python 3.11+
- Node.js 18+

---

## Option 1: Full Kubernetes Deployment (Recommended for Production)

### Step 1: Start Minikube
```powershell
minikube start
```

### Step 2: Verify Minikube is Running
```powershell
minikube status
```

### Step 3: Check All Pods are Running
```powershell
minikube kubectl -- get pods -n oracle-monitor
```

You should see:
- `kafka-0` - Running
- `research-agent-deployment-xxx` - Running
- `writer-agent-deployment-xxx` - Running
- `k8s-collector-deployment-xxx` - Running
- `log-collector-deployment-xxx` - Running

### Step 4: Start Backend API (Local)
```powershell
cd oracle-monitor
uvicorn api.main:app --reload --port 8000
```

### Step 5: Start Frontend
```powershell
cd oracle-monitor/frontend
npm run dev
```

### Step 6: Access Dashboard
Open browser to: `http://localhost:5173`

You should see:
- **Agents** displayed with their status
- **Live logs** streaming from Kafka
- **Task IDs** clickable for traceability
- **Download PDF Report** button functional

---

## Option 2: Local Development (Faster for Testing)

### Step 1: Start Backend API
```powershell
cd oracle-monitor
uvicorn api.main:app --reload --port 8000
```

### Step 2: Start Research Agent
```powershell
cd oracle-monitor
.\run_research_agent.bat
```

### Step 3: Start Writer Agent
```powershell
cd oracle-monitor
.\run_writer_agent.bat
```

### Step 4: Start Frontend
```powershell
cd oracle-monitor/frontend
npm run dev
```

### Step 5: Access Dashboard
Open browser to: `http://localhost:5173`

---

## Verifying System is Working

### Check Agents are Running
```powershell
# For Kubernetes
minikube kubectl -- logs -n oracle-monitor -l app=research-agent --tail=20

# For Local
# Check terminal where run_research_agent.bat is running
```

### Check Logs in Supabase
```powershell
python frontend/test_supabase.py
```

Should show:
- Latest snapshot data
- Recent logs from agents

### Check Frontend Dashboard
1. Navigate to `http://localhost:5173`
2. You should see:
   - **Active Agents**: research-agent, writer-agent
   - **Live Logs**: Continuous stream of agent activity
   - **Task IDs**: Clickable badges for traceability
   - **System Metrics**: CPU, Memory, Queue depths

### Download PDF Report
1. Click "Download PDF Report" button
2. PDF should download with:
   - Executive Summary (agent counts, tasks, queues)
   - Agent Observatory (all agents and their tasks)
   - Infrastructure Workload (pod status)
   - Recent Activity Logs (last 20 entries)

---

## Troubleshooting

### Pods Not Running
```powershell
# Check pod status
minikube kubectl -- get pods -n oracle-monitor

# Check pod logs
minikube kubectl -- describe pod <pod-name> -n oracle-monitor

# Restart deployment
minikube kubectl -- rollout restart deployment/<deployment-name> -n oracle-monitor
```

### No Logs Appearing
```powershell
# Check Kafka is running
minikube kubectl -- get pods -n oracle-monitor | findstr kafka

# Check log collector
minikube kubectl -- logs -n oracle-monitor -l app=log-collector --tail=50
```

### Agents Not Visible in Dashboard
```powershell
# Check k8s-collector is running
minikube kubectl -- logs -n oracle-monitor -l app=k8s-collector --tail=50

# Verify Supabase connection
python frontend/test_supabase.py
```

### PDF Download Fails
- Ensure API is running on port 8000
- Check `reportlab` is installed: `pip install reportlab`
- Check browser console for errors

---

## System Architecture

```
Agents (K8s) → Kafka → Log Collector → Supabase
     ↓                                      ↓
  Register                            Frontend (Real-time)
     ↓
  API Server
     ↓
K8s Collector → Snapshots → Supabase
```

---

## Environment Variables

### Required for Kubernetes
All configured in `infrastructure/kubernetes/config-secret.yaml`:
- `KAFKA_BOOTSTRAP_SERVERS`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `API_URL`

### Required for Local Development
Create `.env` file in `oracle-monitor/` directory:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

---

## Quick Commands Reference

### Minikube
```powershell
minikube start                    # Start cluster
minikube stop                     # Stop cluster
minikube status                   # Check status
minikube dashboard                # Open K8s dashboard
```

### Kubectl (via Minikube)
```powershell
minikube kubectl -- get pods -n oracle-monitor              # List pods
minikube kubectl -- logs <pod-name> -n oracle-monitor       # View logs
minikube kubectl -- describe pod <pod-name> -n oracle-monitor  # Pod details
minikube kubectl -- rollout restart deployment -n oracle-monitor  # Restart all
```

### Docker Images
```powershell
minikube image build -t oracle-monitor-agent:latest -f agents/Dockerfile.agent .
minikube image build -t oracle-monitor-collector:latest -f collectors/Dockerfile.collector .
minikube image ls                 # List images in Minikube
```

---

## Support

For issues or questions, check:
1. Pod logs: `minikube kubectl -- logs <pod-name> -n oracle-monitor`
2. Supabase connection: `python frontend/test_supabase.py`
3. Frontend console: Browser DevTools → Console
