#!/bin/bash
set -e

services=(
    "discovery-server"
    "gateway-service"
    "auth-service"
    "order-service"
    "driver-service"
    "tracking-service"
    "pod-service"
    "analytics-service"
)

echo "Starting build for all services..."

for service in "${services[@]}"
do
    echo "------------------------------------------------"
    echo "Building $service..."
    echo "------------------------------------------------"
    cd backend/$service
    mvn clean package -DskipTests
    if [ $? -ne 0 ]; then
        echo "Build failed for $service"
        exit 1
    fi
    cd ../..
done

echo "------------------------------------------------"
echo "All services built successfully!"
echo "------------------------------------------------"
