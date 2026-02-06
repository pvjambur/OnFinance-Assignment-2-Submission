import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    # Kafka
    KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    KAFKA_TOPIC_TASKS = os.getenv("KAFKA_TOPIC_TASKS", "agent-tasks")
    
    # LiteLLM
    LITELLM_URL = os.getenv("LITELLM_URL", "http://localhost:4000")
    LITELLM_MASTER_KEY = os.getenv("LITELLM_MASTER_KEY")
    
    # K8s
    # Assumes in-cluster config or KUBECONFIG if local
    
    # Agent API
    AGENT_API_URL = os.getenv("AGENT_API_URL", "http://localhost:8080")
    
    # Orchestrator
    COLLECTOR_INTERVAL_SECONDS = int(os.getenv("COLLECTOR_INTERVAL_SECONDS", "10"))
