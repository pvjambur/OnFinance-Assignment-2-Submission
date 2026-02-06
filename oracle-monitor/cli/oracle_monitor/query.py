import os
from supabase import create_client, Client
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone

# Helper to get supabase client
def get_client() -> Optional[Client]:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)

def get_latest_snapshot() -> Optional[Dict[str, Any]]:
    client = get_client()
    if not client:
        return {"error": "Supabase credentials missing"}
    
    try:
        response = client.table("system_snapshots") \
            .select("state") \
            .order("timestamp", desc=True) \
            .limit(1) \
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]["state"]
        return None
    except Exception as e:
        return {"error": str(e)}

def get_snapshots_since(minutes: int) -> List[Dict[str, Any]]:
    client = get_client()
    if not client:
        return []
    
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    try:
        response = client.table("system_snapshots") \
            .select("state") \
            .gte("timestamp", cutoff.isoformat()) \
            .order("timestamp", desc=True) \
            .execute()
        
        return [item["state"] for item in response.data]
    except Exception:
        return []

def get_snapshot_by_id(snapshot_id: str) -> Optional[Dict[str, Any]]:
    client = get_client()
    if not client:
        return None
        
    try:
        response = client.table("system_snapshots") \
            .select("state") \
            .eq("snapshot_id", snapshot_id) \
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]["state"]
        return None
    except Exception:
        return None
