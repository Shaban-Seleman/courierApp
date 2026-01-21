package com.courier.payment.dto;

public record PaymentData(
    String id, // paymentIntentId
    String orderId,
    Double amount,
    String currency
) {}
