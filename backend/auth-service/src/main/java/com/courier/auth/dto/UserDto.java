package com.courier.auth.dto;

import java.util.UUID;

public record UserDto(
    UUID id,
    String email,
    String fullName,
    String role,
    String phone,
    boolean emailNotifications,
    boolean smsNotifications,
    boolean pushNotifications,
    Double defaultLatitude,
    Double defaultLongitude,
    String defaultCity,
    String theme
) {}
