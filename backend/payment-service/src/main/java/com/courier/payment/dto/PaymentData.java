package com.courier.payment.dto;

public record PaymentData(
    String paymentIntentId,
    String clientSecret,
    String status
) {}