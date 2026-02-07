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
        while not self._shutdown_event.is_set():
            try:
                payload = {
                    "name": self.name,
                    "deployment_name": self.deployment_name,
                    "description": f"{self.name} agent",
                    "models": [],
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                response = requests.post(f"{self.api_url}/agents/register", json=payload, timeout=5)
                if response.status_code == 200:
                    logger.info(f"Agent {self.name} registered successfully.")
                    return
                else:
                    logger.warning(f"Registration failed: {response.status_code}. Retrying in 5s...")
            except Exception as e:
                logger.error(f"Failed to register: {e}. Retrying in 5s...")
            time.sleep(5)

    def heartbeat(self):
        """Send heartbeat to API."""
        try:
            payload = {
                "name": self.name,
                "deployment_name": self.deployment_name,
                "description": f"{self.name} agent",
                "models": [],
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            requests.post(f"{self.api_url}/agents/heartbeat", json=payload, timeout=2)
        except Exception as e:
            logger.debug(f"Heartbeat failed: {e}")

    def _heartbeat_loop(self):
        """Background heartbeat thread."""
        while self.running:
            self.heartbeat()
            time.sleep(30)

    def _consume_tasks(self):
        """Consume tasks from Kafka (optional for agents that need it)."""
        try:
            self.consumer = KafkaConsumer(
                self.task_topic,
                bootstrap_servers=self.kafka_bootstrap_servers,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                group_id=f"{self.name}-group",
                auto_offset_reset='latest'
            )
            logger.info(f"Agent {self.name} connected to Kafka Consumer.")
            
            for message in self.consumer:
                if not self.running:
                    break
                task = message.value
                logger.info(f"Received task: {task}")
                # Process task (to be implemented by subclass)
                
        except Exception as e:
            logger.error(f"Consumer error: {e}")

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
    
    def start(self):
        """Start the agent - initializes connections and runs main loop."""
        logger.info(f"Starting agent: {self.name}")
        self._init_producer()
        self.register()
        self.running = True
        
        # Start heartbeat thread
        heartbeat_thread = threading.Thread(target=self._heartbeat_loop, daemon=True)
        heartbeat_thread.start()
        
        try:
            self.run()
        except KeyboardInterrupt:
            logger.info(f"Agent {self.name} stopping...")
        finally:
            self.running = False
            if self.producer:
                self.producer.close()
            if self.consumer:
                self.consumer.close()