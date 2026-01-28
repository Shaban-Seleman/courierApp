package com.courier.auth.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String token);
    void sendNotificationEmail(String to, String subject, String text);
}
