package com.courier.order.controller;

import com.courier.order.dto.CreateOrderRequest;
import com.courier.order.entity.Order;
import com.courier.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request, userId));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getMyOrders(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(orderService.getMyOrders(userId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Order>> getAvailableOrders() {
        return ResponseEntity.ok(orderService.getAvailableOrders());
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<Order>> getDriverOrders(@RequestHeader("X-User-Id") String driverId) {
        return ResponseEntity.ok(orderService.getDriverOrders(driverId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(
            @PathVariable UUID id,
            @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }
    
    @PutMapping("/{id}/assign/{driverId}")
    public ResponseEntity<Order> assignDriver(
            @PathVariable UUID id,
            @PathVariable UUID driverId) {
        return ResponseEntity.ok(orderService.assignDriver(id, driverId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Order>> getRecentActivities(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(orderService.getRecentOrderActivities(limit));
    }
}
