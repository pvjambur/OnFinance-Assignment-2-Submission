from fastapi import APIRouter
from api.models.task import Task

router = APIRouter()

@router.post("/")
async def create_task(task: Task):
    # In a real system, this would push to Kafka
    # producer.send("agent-tasks", task.json().encode('utf-8'))
    return {"status": "task_queued", "task_id": task.id}
