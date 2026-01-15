package com.courier.auth.dto;

import com.courier.auth.entity.User;

public record RegisterRequest(
    String fullName,
    String email,
    String password,
    User.Role role
) {}
