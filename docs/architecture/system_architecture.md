# Courier Management Application - System Architecture

## Overview
The Courier Management Application is a distributed, event-driven microservices system designed to handle the end-to-end lifecycle of package delivery. It supports three distinct user roles: **Customers** (placing orders), **Drivers** (fulfilling deliveries), and **Admins** (monitoring operations).

## Tech Stack
- **Backend**: Java 21 (Virtual Threads), Spring Boot 3.2
- **Frontend**: React (Web Admin), React Native (Mobile Driver/Customer)
- **Data Stores**: PostgreSQL (Relational), Redis (Geo-spatial/Caching), MinIO (Object Storage)
- **Message Broker**: RabbitMQ (Event-driven communication)
- **Infrastructure**: Docker Compose, Spring Cloud Gateway, Eureka Discovery

## System Components

### 1. Infrastructure Layer
| Component | Technology | Description |
|-----------|------------|-------------|
| **API Gateway** | Spring Cloud Gateway | Single entry point. Handles JWT validation, routing, and rate limiting. |
| **Service Discovery** | Netflix Eureka | Dynamic service registration and load balancing. |
| **Event Bus** | RabbitMQ | Asynchronous communication between services (e.g., `Order Created` -> `Notification`). |

### 2. Microservices Layer

#### **Auth Service** (`auth-service`)
- **Responsibility**: Identity and Access Management.
- **Key Features**: Login, Registration, JWT Generation.
- **Database**: `auth_db` (Users, Roles).

#### **Order Service** (`order-service`)
- **Responsibility**: Manages the lifecycle of a delivery order.
- **State Machine**: `PENDING` -> `ASSIGNED` -> `PICKED_UP` -> `DELIVERED` -> `CANCELLED`.
- **Key Features**: CRUD operations, Driver Assignment logic.
- **Database**: `order_db` (Orders).

#### **Driver Service** (`driver-service`)
- **Responsibility**: Manages driver profiles and availability.
- **Key Features**: Toggle Online/Offline status, Vehicle management.
- **Database**: `driver_db` (Driver Profiles).

#### **Tracking Service** (`tracking-service`)
- **Responsibility**: Real-time location tracking.
- **Technology**: **WebSockets (STOMP)** for live updates, **Redis GEO** for storing coordinates.
- **Flow**: Driver Phone -> WebSocket -> Redis -> Subscriber (Customer/Admin).

#### **Proof of Delivery (PoD) Service** (`pod-service`)
- **Responsibility**: Verification of delivery completion.
- **Key Features**: Uploads Photos/Signatures to **MinIO** (S3 compatible).
- **Integration**: Triggers `order.delivered` event upon successful upload.
- **Database**: `pod_db` (Metadata).

#### **Payment Service** (Stub)
- **Responsibility**: Handling payments.
- **Key Features**: Webhook receiver for payment gateways (e.g., Stripe).

#### **Analytics Service** (Stub)
- **Responsibility**: Reporting and Metrics.
- **Key Features**: Listens to domain events to calculate Driver Ratings and On-Time performance.

### 3. Frontend Layer

#### **Web Admin Dashboard** (`web/`)
- **Tech**: React, Redux Toolkit.
- **Features**: Live Map (consuming WebSocket tracking), Order Management Table, Driver Verification.

#### **Mobile Driver App** (`mobile/`)
- **Tech**: React Native.
- **Features**: Job List, Status Toggle, Location Background Service, Camera/Signature Capture for PoD.

## Data Flow Examples

### A. Delivery Completion Flow
1. **Driver** captures photo/signature in Mobile App.
2. **Mobile App** uploads files to **PoD Service**.
3. **PoD Service** saves files to **MinIO** and metadata to DB.
4. **PoD Service** publishes `order.delivered` event to **RabbitMQ**.
5. **Order Service** consumes event -> Updates status to `DELIVERED`.
6. **Analytics Service** consumes event -> Updates driver performance metrics.
7. **Notification Service** (Planned) -> Sends push notification to Customer.

### B. Real-Time Tracking Flow
1. **Driver App** emits GPS coordinates every 5s via **WebSocket**.
2. **Tracking Service** receives coordinates -> Updates **Redis GEO**.
3. **Tracking Service** broadcasts update to `/topic/orders/{orderId}`.
4. **Customer App** subscribes to topic -> Updates map marker in real-time.

## Security Architecture
- **JWT**: Stateless authentication. Token contains `userId` and `role`.
- **Gateway Filter**: Intercepts requests, validates JWT signature, and injects `X-User-Id` header for microservices.
- **Microservices**: Trust the Gateway; use `X-User-Id` for business logic (e.g., "Get My Orders").

## Deployment
- **Docker Compose**: Orchestrates all services, databases, and brokers for local development.
- **Ports**:
  - Gateway: `8080`
  - Eureka: `8761`
  - Auth: `8081`
  - Order: `8082`
  - Driver: `8083`
  - Tracking: `8084`
  - PoD: `8085`
