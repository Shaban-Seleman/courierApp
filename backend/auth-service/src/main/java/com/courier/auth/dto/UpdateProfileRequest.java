package com.courier.auth.dto;

public record UpdateProfileRequest(
    String fullName,
    String phone,
    Boolean emailNotifications,
    Boolean smsNotifications,
    Boolean pushNotifications,
    Double defaultLatitude,
    Double defaultLongitude,
    String defaultCity,
    String theme
) {}
