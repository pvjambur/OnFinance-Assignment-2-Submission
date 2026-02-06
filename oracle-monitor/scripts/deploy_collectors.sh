#!/bin/bash
# Deploy collectors locally (for testing without K8s)

echo "Starting collectors..."
python -m collectors.main
