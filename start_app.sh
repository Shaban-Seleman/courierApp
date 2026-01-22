#!/bin/bash

echo "Starting Courier Management Application..."

# Ensure the project root is correct
PROJECT_ROOT=$(pwd)

echo "Building backend services..."
mvn clean package -DskipTests

echo "Building web dashboard..."
cd web
npm install
npm run build
cd "$PROJECT_ROOT"

echo "Starting Docker Compose..."
docker-compose up --build -d

echo "Application started successfully!"
echo "Web Dashboard: http://localhost:3000"
echo "Eureka Discovery: http://localhost:8761"
echo "MinIO Console: http://localhost:9001"
echo "MailHog: http://localhost:8025"
echo "RabbitMQ Management: http://localhost:15672"
