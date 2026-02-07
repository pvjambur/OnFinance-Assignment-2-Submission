from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # 1. Import Middleware
from api.routes import agents, tasks, health, chat, reports

app = FastAPI(title="Oracle Monitor Agent API")

# 2. Configure CORS
# Replace with your actual frontend URL(s) for better security in production
origins = [
    "http://localhost:8080",  # Common for React/Next.js
    "http://localhost:5173",  # Common for Vite
    "http://127.0.0.1:3000",
    "*"                       # Allow ALL origins (use only for dev/testing)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # List of allowed origins
    allow_credentials=True,      # Allow cookies/auth headers
    allow_methods=["*"],         # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],         # Allow all headers
)

app.include_router(agents.router, prefix="/agents", tags=["agents"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(health.router, tags=["health"])

@app.get("/")
async def root():
    return {"message": "Oracle Monitor API is running"}