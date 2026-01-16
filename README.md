# Courier Management System

A microservices-based Courier Management System built with Java 21, Spring Boot 3, and React/React Native.

## Project Structure

- **`backend/`**: Contains all Spring Boot microservices.
  - `discovery-server`: Eureka Server.
  - `gateway-service`: Spring Cloud Gateway with JWT Auth.
  - `auth-service`: Authentication & Identity.
  - `order-service`: Order Lifecycle Management.
  - `driver-service`: Driver Profiles & Status.
  - `tracking-service`: Real-time location tracking (WebSockets + Redis).
  - `pod-service`: Proof of Delivery (MinIO).
  
- **`web/`**: React Admin Dashboard (Vite + Redux Toolkit + Tailwind).
- **`mobile/`**: React Native Driver App (Expo + NativeWind).
- **`infrastructure/`**: Docker & K8s configurations.
- **`docker-compose.yml`**: Orchestrates the local development environment.

## Prerequisites

- Java 21
- Docker & Docker Compose
- Node.js (for frontend)

## Getting Started

1. **Start Infrastructure & Services**:
   ```bash
   docker-compose up -d --build
   ```
   This will start all backend microservices, databases, and the **Web Dashboard** (accessible at http://localhost:3000).

2. **Mobile App**:
   ```bash
   cd mobile
   npm install
   npm start
   ```

## Architecture

- **Service Discovery**: Eureka
- **API Gateway**: Spring Cloud Gateway
- **Communication**: REST (Feign) & Async (RabbitMQ)
- **Database**: PostgreSQL (Per Service)
- **Caching/Geo**: Redis
- **Storage**: MinIO (S3 Compatible)


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
