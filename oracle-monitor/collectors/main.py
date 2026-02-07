import time
import json
import os
import sys
from supabase import create_client, Client
from collectors.aggregator.state_builder import StateBuilder
from collectors.base.config import Config
import logging

# Ensure we can import from root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info("Starting Oracle Monitor Collectors...")
    
    # Initialize Supabase with Service Role Key for admin rights (bypass RLS)
    try:
        url = Config.SUPABASE_URL
        key = Config.SUPABASE_SERVICE_ROLE_KEY or Config.SUPABASE_KEY
        
        if not url or not key:
            raise ValueError("Supabase URL or Key is missing")
            
        supabase: Client = create_client(url, key)
        logger.info("Supabase client initialized.")
    except Exception as e:
        logger.error(f"Error connecting to Supabase: {e}")
        # Continue for now to test collection logic
        supabase = None

    # Path to schema
    schema_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "schema", "oracle_state.schema.json")
    
    builder = StateBuilder()
    
    while True:
        try:
            start_time = time.time()
            logger.info(f"[{time.ctime()}] Collecting state...")
            
            snapshot = builder.build_snapshot()
            
            if supabase:
                data = {
                    "snapshot_id": snapshot["id"],
                    "timestamp": snapshot["timestamp"],
                    "state": snapshot
                }
                # Use upsert or insert
                supabase.table("system_snapshots").insert(data).execute()
                logger.info(f"Snapshot {snapshot.get('id', 'unknown')} saved to Supabase.")
            else:
                logger.warning(f"Snapshot generated (Supabase not connected): {snapshot.get('id', 'unknown')}")
            
            # Sleep logic
            elapsed = time.time() - start_time
            sleep_time = max(0, Config.COLLECTOR_INTERVAL_SECONDS - elapsed)
            time.sleep(sleep_time)
            
        except KeyboardInterrupt:
            logger.info("Stopping collector...")
            break
        except Exception as e:
            logger.error(f"Error in collection loop: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
