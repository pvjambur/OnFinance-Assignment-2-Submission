import time
import json
import os
import sys
from supabase import create_client, Client
from collectors.aggregator.state_builder import StateBuilder
from collectors.base.config import Config

# Ensure we can import from root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def main():
    print("Starting Oracle Monitor Collectors...")
    
    # Initialize Supabase
    try:
        supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
    except Exception as e:
        print(f"Error connecting to Supabase: {e}")
        # Continue for now to test collection logic
        supabase = None

    # Path to schema
    # Assumes running from oracle-monitor root or similar structure
    schema_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "schema", "oracle_state.schema.json")
    
    builder = StateBuilder(schema_path)
    
    while True:
        try:
            start_time = time.time()
            print(f"[{time.ctime()}] Collecting state...")
            
            snapshot = builder.build_snapshot()
            
            if supabase:
                data = {
                    "snapshot_id": snapshot["id"],
                    "timestamp": snapshot["timestamp"],
                    "state": snapshot
                }
                supabase.table("system_snapshots").insert(data).execute()
                print(f"Snapshot {snapshot['id']} saved to Supabase.")
            else:
                print(f"Snapshot generated (Supabase not connected): {snapshot['id']}")
            
            # Sleep logic
            elapsed = time.time() - start_time
            sleep_time = max(0, Config.COLLECTOR_INTERVAL_SECONDS - elapsed)
            time.sleep(sleep_time)
            
        except KeyboardInterrupt:
            print("Stopping collector...")
            break
        except Exception as e:
            print(f"Error in collection loop: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
