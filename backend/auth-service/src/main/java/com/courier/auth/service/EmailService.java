package com.courier.auth.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String token);
}
