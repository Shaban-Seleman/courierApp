package com.courier.analytics.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OrderEventDto(
    UUID id,
    UUID driverId,
    String status
) {}
