package com.courier.order.dto;

public record CreateOrderRequest(
    String pickupAddress,
    String deliveryAddress,
    String packageDescription
) {}
