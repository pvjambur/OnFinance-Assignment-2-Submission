from pydantic import BaseModel
from typing import Optional

class Task(BaseModel):
    id: str
    description: str
    priority: str = "medium"
