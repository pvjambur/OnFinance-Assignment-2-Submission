#!/bin/bash
# Script to create Kafka topics
# Usage: ./infrastructure/kafka/topics.sh

# Name of the container from docker-compose.yml
KAFKA_CONTAINER="oracle-monitor-kafka-1"

# Check if container is running
if ! docker ps | grep -q "$KAFKA_CONTAINER"; then
    echo "Error: Kafka container '$KAFKA_CONTAINER' is not running."
    echo "Please run 'docker-compose up -d' first."
    exit 1
fi

echo "Creating 'agent-tasks' topic..."
docker exec $KAFKA_CONTAINER kafka-topics --create --if-not-exists \
    --bootstrap-server localhost:9092 \
    --replication-factor 1 \
    --partitions 1 \
    --topic agent-tasks

echo "Creating 'agent-logs' topic..."
docker exec $KAFKA_CONTAINER kafka-topics --create --if-not-exists \
    --bootstrap-server localhost:9092 \
    --replication-factor 1 \
    --partitions 1 \
    --topic agent-logs

echo "Kafka topics verification:"
docker exec $KAFKA_CONTAINER kafka-topics --list --bootstrap-server localhost:9092
