package com.courier.tracking.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record LocationUpdate(UUID driverId, double latitude, double longitude, UUID orderId) {
}