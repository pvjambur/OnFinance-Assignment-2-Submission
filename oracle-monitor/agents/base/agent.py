import time
import requests
import os
import logging
import json
import threading
from abc import ABC, abstractmethod
from kafka import KafkaConsumer, KafkaProducer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(self, name: str, api_url: str = "http://api:8000"):
        self.name = name
        self.deployment_name = f"{name}-deployment"
        self.api_url = os.getenv("AGENT_API_URL", api_url)
        self.running = True
        
        # Kafka Config
        self.kafka_bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
        self.task_topic = os.getenv("KAFKA_TOPIC_TASKS", "agent-tasks")
        self.log_topic = os.getenv("KAFKA_TOPIC_LOGS", "agent-logs")
        
        self.producer = None
        self.consumer = None

    def _init_kafka(self):
        """Initialize Kafka connection with retries."""
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=self.kafka_bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
            logger.info(f"Agent {self.name} connected to Kafka Producer.")
        except Exception as e:
            logger.error(f"Failed to connect to Kafka Producer: {e}")

    def register(self):
        """Register the agent with the orchestration API."""
        try:
            # Init Kafka on register
            self._init_kafka()
            
            data = {
                "name": self.name,
                "deployment_name": self.deployment_name,
                "activity": {"active_task_ids": []}
            }
            response = requests.post(f"{self.api_url}/agents/register", json=data)
            response.raise_for_status()
            logger.info(f"Agent {self.name} registered successfully.")
            
            # Start listening thread
            threading.Thread(target=self.listen_for_tasks, daemon=True).start()
            
        except Exception as e:
            logger.error(f"Failed to register agent: {e}")

    def listen_for_tasks(self):
        """Listen for tasks on the shared topic."""
        try:
            self.consumer = KafkaConsumer(
                self.task_topic,
                bootstrap_servers=self.kafka_bootstrap_servers,
                group_id=f"{self.name}-group",
                value_deserializer=lambda x: json.loads(x.decode('utf-8'))
            )
            logger.info(f"Agent {self.name} listening on {self.task_topic}...")
            
            for message in self.consumer:
                if not self.running: break
                task = message.value
                # Simple filter: check if task is meant for this agent type (by name matching or explicit target)
                # For this demo, we'll just log receiving it
                self.publish_log(f"Received potential task: {task.get('id')}")
                
        except Exception as e:
            logger.error(f"Kafka Consumer error: {e}")

    def publish_log(self, message: str):
        """Send a log message to the log topic."""
        if self.producer:
            try:
                log_entry = {
                    "agent": self.name,
                    "timestamp": time.time(),
                    "message": message
                }
                self.producer.send(self.log_topic, log_entry)
            except Exception as e:
                logger.error(f"Failed to publish log: {e}")

    @abstractmethod
    def run(self):
        """Main agent loop."""
        pass
    
    def report_status(self, task_id: str = None, status: str = "idle"):
        # Implementation to report status to API
        pass
