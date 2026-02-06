#!/bin/bash
# Cleanup resources

echo "Stopping infrastructure..."
docker-compose down

echo "Cleanup complete."
