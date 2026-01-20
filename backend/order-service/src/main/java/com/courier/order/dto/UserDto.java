package com.courier.order.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserDto(
    UUID id,
    String email,
    @JsonProperty("fullName") String fullName,
    String role
) {}
