package com.courier.order.dto;

public record OrderStatsResponse(
    long pending,
    long assigned,
    long pickedUp,
    long delivered,
    long cancelled,
    long total
) {}
