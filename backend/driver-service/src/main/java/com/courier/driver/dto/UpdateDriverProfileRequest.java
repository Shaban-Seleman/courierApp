package com.courier.driver.dto;

public record UpdateDriverProfileRequest(
    String vehicleType,
    String licensePlate
) {}
