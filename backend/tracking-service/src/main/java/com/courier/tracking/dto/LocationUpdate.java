package com.courier.tracking.dto;

import java.util.UUID;

public record LocationUpdate(UUID driverId, double latitude, double longitude, UUID orderId) {
}