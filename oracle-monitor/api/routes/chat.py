import os
from fastapi import APIRouter
from pydantic import BaseModel
from supabase import create_client, Client
from google import genai
from google.genai import types
from dotenv import load_dotenv # 1. Import load_dotenv
import json

# 2. Load the .env file immediately
# This looks for a .env file in the current directory or parents
load_dotenv() 

# Now import settings (which presumably reads os.environ)
from api.config import settings

router = APIRouter()

# Initialize clients
# Ensure your config/settings actually reads from os.getenv('SUPABASE_URL')
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Initialize the new client
# You can now explicitly verify the key exists
api_key = settings.GEMINI_API_KEY
if not api_key:
    # Fallback to os.getenv directly if settings module fails
    api_key = os.getenv("GEMINI_API_KEY") 

client = genai.Client(api_key=api_key)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    context_used: bool

@router.post("/query", response_model=ChatResponse)
async def query_oracle(request: ChatRequest):
    try:
        # 1. Fetch Snapshot
        response = supabase.table("system_snapshots") \
            .select("*") \
            .order("timestamp", desc=True) \
            .limit(1) \
            .execute()
        
        snapshot_context = "No system data available."
        if response.data:
            snapshot = response.data[0].get("snapshot", {})
            snapshot_context = json.dumps(snapshot, indent=2)[:30000]

        # 2. Construct Prompt
        system_instructions = f"""
        You are Oracle, the AI monitor.
        CURRENT SYSTEM STATE (JSON Snapshot):
        {snapshot_context}
        Answer questions about system health.
        """

        # 3. Call Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=request.message,
            config=types.GenerateContentConfig(
                system_instruction=system_instructions
            )
        )
        
        return ChatResponse(reply=response.text, context_used=True)

    except Exception as e:
        print(f"Chat Error: {e}")
        return ChatResponse(reply=f"Error: {str(e)}", context_used=False)