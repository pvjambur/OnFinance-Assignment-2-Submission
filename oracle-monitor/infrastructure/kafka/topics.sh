#!/bin/bash
# Script to create Kafka topics

KAFKA_CONTAINER="oracle-monitor-kafka-1"

docker exec $KAFKA_CONTAINER kafka-topics --create --if-not-exists \
    --bootstrap-server localhost:9092 \
    --replication-factor 1 \
    --partitions 1 \
    --topic agent-tasks

docker exec $KAFKA_CONTAINER kafka-topics --create --if-not-exists \
    --bootstrap-server localhost:9092 \
    --replication-factor 1 \
    --partitions 1 \
    --topic agent-logs

echo "Kafka topics created."
