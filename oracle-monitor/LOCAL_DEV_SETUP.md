# Oracle Monitor - Local Development Setup

## Quick Start (No Kubernetes Required)

This setup runs all agents **locally** on your machine, connecting directly to Supabase.

### Step 1: Start Backend API
```powershell
cd oracle-monitor
uvicorn api.main:app --reload --port 8000
```

### Step 2: Start Research Agent (Terminal 2)
```powershell
cd oracle-monitor
python -m agents.research_agent.main
```

### Step 3: Start Writer Agent (Terminal 3)
```powershell
cd oracle-monitor
python -m agents.writer_agent.main
```

### Step 4: Start Frontend (Terminal 4)
```powershell
cd oracle-monitor/frontend
npm run dev
```

## What You'll See

- **Research Agent**: Emits logs every ~5 seconds with 6-phase cycles
- **Writer Agent**: Emits logs every ~6 seconds with report generation phases
- **Frontend**: Displays all logs in real-time at `http://localhost:5173`
- **PDF Reports**: Click "Download PDF Report" button to generate system report

## Environment Variables Required

Make sure `.env` file exists in `oracle-monitor` directory with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

## Troubleshooting

**No logs appearing?**
- Check that agents are running (you should see console output)
- Verify Supabase credentials in `.env`
- Check frontend console for errors

**Agents crashing?**
- Install dependencies: `pip install -r requirements.txt`
- Check that `agents/base/agent.py` exists

**PDF download failing?**
- Ensure API is running on port 8000
- Check that `reportlab` is installed: `pip install reportlab`
