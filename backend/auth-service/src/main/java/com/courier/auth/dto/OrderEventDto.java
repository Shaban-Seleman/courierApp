package com.courier.auth.dto;

import java.util.UUID;

public record OrderEventDto(
    UUID id,
    UUID customerId,
    String status,
    String pickupAddress,
    String deliveryAddress
) {}
