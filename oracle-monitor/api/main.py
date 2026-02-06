from fastapi import FastAPI
from api.routes import agents, tasks, health

app = FastAPI(title="Oracle Monitor Agent API")

app.include_router(agents.router, prefix="/agents", tags=["agents"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(health.router, tags=["health"])

@app.get("/")
async def root():
    return {"message": "Oracle Monitor API is running"}
