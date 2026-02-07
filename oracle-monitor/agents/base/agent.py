import time
import requests
import os
import logging
import json
import threading
from typing import Optional
from datetime import datetime, timezone
from abc import ABC, abstractmethod
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import KafkaError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(self, name: str, api_url: str = "http://api:8000"):
        self.name = name
        self.deployment_name = f"{name}-deployment"
        self.api_url = os.getenv("AGENT_API_URL", api_url)
        self.running = False # Start false, set true in run
        
        # Kafka Config
        self.kafka_bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
        self.task_topic = os.getenv("KAFKA_TOPIC_TASKS", "agent-tasks")
        self.log_topic = os.getenv("KAFKA_TOPIC_LOGS", "agent-logs")
        
        self.producer = None
        self.consumer = None
        self._shutdown_event = threading.Event()

    def _init_producer(self):
        """Initialize Kafka Producer with retries."""
        while not self._shutdown_event.is_set():
            try:
                self.producer = KafkaProducer(
                    bootstrap_servers=self.kafka_bootstrap_servers,
                    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                    # Fix: Ensure reliability
                    acks='all',
                    retries=3
                )
                logger.info(f"Agent {self.name} connected to Kafka Producer.")
                return
            except Exception as e:
                logger.error(f"Failed to connect to Kafka Producer: {e}. Retrying in 5s...")
                time.sleep(5)

    def register(self):
        """Register with retry logic."""
        self._init_producer()
        
        while not self._shutdown_event.is_set():
            try:
                data = {
                    "name": self.name,
                    "deployment_name": self.deployment_name,
                    "activity": {"active_task_ids": []}
                }
                response = requests.post(f"{self.api_url}/agents/register", json=data, timeout=5)
                response.raise_for_status()
                logger.info(f"Agent {self.name} registered successfully.")
                self.running = True
                
                # Start listener only after successful registration
                threading.Thread(target=self.listen_for_tasks, daemon=True).start()
                return
            except Exception as e:
                logger.error(f"Registration failed: {e}. Retrying in 5s...")
                time.sleep(5)

    def listen_for_tasks(self):
        """Robust listener loop that recovers from crashes."""
        while self.running and not self._shutdown_event.is_set():
            try:
                # Re-initialize consumer if loop restarts due to error
                consumer = KafkaConsumer(
                    self.task_topic,
                    bootstrap_servers=self.kafka_bootstrap_servers,
                    group_id=f"{self.name}-group",
                    auto_offset_reset='latest',
                    value_deserializer=lambda x: json.loads(x.decode('utf-8')),
                    consumer_timeout_ms=1000 # Fix: Don't block forever, check self.running
                )
                
                logger.info(f"Agent {self.name} listening...")
                
                for message in consumer:
                    if not self.running: break
                    
                    task = message.value
                    
                    # Log logic to ensure we don't crash on missing keys
                    task_id = task.get('id', 'unknown')
                    target_agent = task.get('target_agent')

                    # Fix: Filtering Logic
                    # If using a unique group_id per agent instance, this is fine.
                    # If sharing group_ids, you are "stealing" tasks from others.
                    if target_agent and target_agent != self.name:
                        continue 

                    self.publish_log(f"Received task: {task_id}")
                    
                    # TODO: Actually process the task here
                    
            except Exception as e:
                logger.error(f"Kafka Consumer error (restarting listener): {e}")
                time.sleep(2) # Prevent tight loop crash
            finally:
                try:
                    consumer.close()
                except:
                    pass

    def publish_log(self, message: str, level: str = "info", task_id: Optional[str] = None):
        # SAFETY CHECK: Only try to send if producer exists
        if self.producer is not None:
            try:
                log_entry = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "level": level,
                    "message": message,
                    "source": self.name,
                    "task_id": task_id
                }
                self.producer.send(self.log_topic, log_entry)
            except Exception as e:
                logger.error(f"Failed to publish log: {e}")
        else:
            logger.warning("Kafka Producer is NOT connected. Log skipped.")

    def shutdown(self):
        self.running = False
        # SAFETY CHECK: Only flush/close if producer exists
        if self.producer is not None:
            self.producer.flush()
            self.producer.close()

    @abstractmethod
    def run(self):
        """
        Main loop. 
        Implementation MUST keep the process alive (e.g., while True: time.sleep(1))
        """
        pass