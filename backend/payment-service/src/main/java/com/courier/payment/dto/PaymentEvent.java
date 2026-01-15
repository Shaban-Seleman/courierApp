package com.courier.payment.dto;

import java.util.Map;

public record PaymentEvent(
    String id,
    String type,
    PaymentData data
) {}
