from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TaskStatus(BaseModel):
    id: str
    status: str
    started_on: datetime
    waiting_since_mins: Optional[float] = 0

class AgentActivity(BaseModel):
    active_task_ids: List[TaskStatus] = []

class AgentRegistration(BaseModel):
    name: str
    deployment_name: str
    activity: AgentActivity = AgentActivity()
