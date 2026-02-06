from fastapi import APIRouter, HTTPException
from api.models.agent import AgentRegistration
from typing import List, Dict

router = APIRouter()

# In-memory store for agent status (would be Redis/DB in production)
agent_store: Dict[str, AgentRegistration] = {}

@router.post("/register")
async def register_agent(agent: AgentRegistration):
    agent_store[agent.name] = agent
    return {"status": "registered", "agent": agent.name}

@router.post("/heartbeat")
async def agent_heartbeat(agent: AgentRegistration):
    if agent.name not in agent_store:
        raise HTTPException(status_code=404, detail="Agent not registered")
    
    agent_store[agent.name] = agent
    return {"status": "updated"}

@router.get("/status", response_model=List[AgentRegistration])
async def get_agents_status():
    return list(agent_store.values())
