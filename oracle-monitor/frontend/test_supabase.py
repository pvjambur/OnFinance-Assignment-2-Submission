import os
import json
import time
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("VITE_SUPABASE_URL")
if not url:
    # Try backend env var name
    url = os.getenv("SUPABASE_URL")
    
key = os.getenv("VITE_SUPABASE_ANON_KEY")
if not key:
    # Try backend env var name
    key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"Testing connection to: {url}")

if not url or not key:
    print("Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY/SUPABASE_KEY")
    exit(1)

supabase = create_client(url, key)

# Test Read
print("Attempting to fetch snapshots...")
try:
    response = supabase.table("system_snapshots").select("*").order("timestamp", desc=True).limit(1).execute()
    print(f"Fetch success. Count: {len(response.data)}")
    if len(response.data) > 0:
        print("Latest Snapshot Data:")
        print(json.dumps(response.data[0], indent=2))
    if len(response.data) == 0:
        print("Table is empty. Attempting insert to fix 406 Error...")
        
        # Test Insert (Dummy Data) to unblock frontend
        dummy_data = {
            "snapshot_id": "test-snapshot-" + str(int(time.time())),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "state": {
                "agents": [],
                "workload": [],
                "queues": [],
                "litellm": []
            }
        }
        
        # Note: Anon key might not have INSERT permission if RLS is strict,
        # but the migration I provided allows Service Role inserts. 
        # If this fails with Anon, it confirms RLS policy.
        try:
            insert_res = supabase.table("system_snapshots").insert(dummy_data).execute()
            print("Insert success!", insert_res)
        except Exception as e:
            print(f"Insert failed: {e}")
            print("This is expected if you haven't run the RLS migration or are using Anon key without policy.")

except Exception as e:
    print(f"Connection failed: {e}")
