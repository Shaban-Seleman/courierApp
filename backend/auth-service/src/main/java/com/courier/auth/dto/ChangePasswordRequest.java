package com.courier.auth.dto;

public record ChangePasswordRequest(
    String currentPassword,
    String newPassword,
    String confirmPassword
) {}
