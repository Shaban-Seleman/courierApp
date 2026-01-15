package com.courier.driver.dto;

public record DriverProfileRequest(
    String vehicleType,
    String licensePlate
) {}
