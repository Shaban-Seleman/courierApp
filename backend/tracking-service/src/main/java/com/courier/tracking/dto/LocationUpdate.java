package com.courier.tracking.dto;

import java.util.UUID;

public record LocationUpdate(
    UUID driverId,
    UUID orderId,
    double latitude,
    double longitude
) {}
