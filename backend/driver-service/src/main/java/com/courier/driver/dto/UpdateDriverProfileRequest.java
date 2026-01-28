package com.courier.driver.dto;

public record UpdateDriverProfileRequest(
    String vehicleType,
    String licensePlate,
    java.time.LocalTime shiftStart,
    java.time.LocalTime shiftEnd
) {}
