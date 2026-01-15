# Courier Management System

A microservices-based Courier Management System built with Java 21 and Spring Boot 3.

## Project Structure

- **`backend/`**: Contains all Spring Boot microservices.
  - `discovery-server`: Eureka Server.
  - `gateway-service`: Spring Cloud Gateway with JWT Auth.
  - `auth-service`: Authentication & Identity.
  - `order-service`: Order Lifecycle Management.
  - `driver-service`: Driver Profiles & Status.
  - `tracking-service`: Real-time location tracking (WebSockets + Redis).
  - `pod-service`: Proof of Delivery (MinIO).
  
- **`infrastructure/`**: Docker & K8s configurations.
- **`docker-compose.yml`**: Orchestrates the local development environment.

## Prerequisites

- Java 21
- Docker & Docker Compose

## Getting Started

1. **Start Infrastructure**:
   ```bash
   docker-compose up -d
   ```

2. **Build & Run Services**:
   (Instructions to be added as services are finalized)

## Architecture

- **Service Discovery**: Eureka
- **API Gateway**: Spring Cloud Gateway
- **Communication**: REST (Feign) & Async (RabbitMQ)
- **Database**: PostgreSQL (Per Service)
- **Caching/Geo**: Redis
- **Storage**: MinIO (S3 Compatible)
