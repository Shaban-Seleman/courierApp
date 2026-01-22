package com.courier.payment.dto;

import java.util.UUID;

public record PaymentEvent(
    UUID orderId,
    String status
) {}