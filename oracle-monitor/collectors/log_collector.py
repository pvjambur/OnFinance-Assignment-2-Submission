import os
import json
import time
import logging
from kafka import KafkaConsumer
from supabase import create_client, Client
from collectors.base.config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("LogCollector")

def main():
    # Initialize Supabase
    supabase_url = Config.SUPABASE_URL
    supabase_key = Config.SUPABASE_SERVICE_ROLE_KEY
    if not supabase_url or not supabase_key:
        logger.error("Supabase credentials missing!")
        return
    
    supabase: Client = create_client(supabase_url, supabase_key)
    logger.info("Connected to Supabase.")

    # Initialize Kafka
    kafka_servers = Config.KAFKA_BOOTSTRAP_SERVERS
    topic = os.getenv("KAFKA_TOPIC_LOGS", "agent-logs")
    
    logger.info(f"Connecting to Kafka at {kafka_servers} for topic {topic}...")
    
    consumer = None
    while consumer is None:
        try:
            consumer = KafkaConsumer(
                topic,
                bootstrap_servers=kafka_servers,
                auto_offset_reset='latest',
                enable_auto_commit=True,
                group_id='log-sync-group',
                value_deserializer=lambda x: json.loads(x.decode('utf-8'))
            )
        except Exception as e:
            logger.error(f"Failed to connect to Kafka: {e}. Retrying in 5s...")
            time.sleep(5)

    logger.info("Log Collector started. Waiting for logs...")

    try:
        for message in consumer:
            log_data = message.value
            logger.info(f"Received log: {log_data.get('message', 'no message')}")
            
            # Map Kafka log to Supabase schema
            # Kafka log likely has: level, message, source, timestamp
            try:
                data = {
                    "level": log_data.get("level", "info"),
                    "message": log_data.get("message", ""),
                    "source": log_data.get("source", "unknown"),
                    "timestamp": log_data.get("timestamp", None),
                    "task_id": log_data.get("task_id", None)
                }
                
                # Insert into Supabase
                supabase.table("agent_logs").insert(data).execute()
                
            except Exception as e:
                logger.error(f"Failed to insert log into Supabase: {e}")

    except KeyboardInterrupt:
        logger.info("Stopping Log Collector...")
    finally:
        if consumer:
            consumer.close()

if __name__ == "__main__":
    main()
