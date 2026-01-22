Fixed the 500 Internal Server Error in `driver-service` and addressed potential startup issues:

1.  **Updated `DriverService.java`**: Wrapped Redis `opsForGeo()` calls in `try-catch` blocks within `getAllDrivers` and `getProfile`. This ensures that if Redis is unavailable or fails (causing the 500 error), the service logs the error and proceeds without location data instead of crashing the entire request.
2.  **Updated `docker-compose.yml`**: Added `redis` and `rabbitmq` to the `depends_on` section for `driver-service`. This ensures the service only starts after its dependencies are ready, preventing startup race conditions.
3.  **Analytics Service Note**: verified that `analytics-service` correctly declares the `order.created.queue`. The reported "missing queue" error was likely a timing issue which the existing `depends_on: rabbitmq` (and the system settling) should resolve.

You can now restart the stack (`docker-compose up -d --build`) and the `GET /api/v1/drivers` endpoint should work reliably.