#!/bin/bash
# Setup local development environment

echo "Setting up Oracle Monitor..."

# 1. Start Infrastructure
echo "Starting Supabase and Kafka..."
docker-compose up -d

# 2. Apply Migrations (Simulated)
# In reality: PGPASSWORD=postgres psql -h localhost -U postgres -f infrastructure/supabase/migrations/001_initial_schema.sql
# For now we assume docker-compose handles it or manual step

# 3. Create Kafka Topics
./infrastructure/kafka/topics.sh

echo "Infrastructure ready."
