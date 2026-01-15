package com.courier.auth.dto;

public record LoginRequest(
    String email,
    String password
) {}
