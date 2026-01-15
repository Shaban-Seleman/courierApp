package com.courier.payment.dto;

public record PaymentData(
    String orderId,
    Double amount,
    String currency
) {}
