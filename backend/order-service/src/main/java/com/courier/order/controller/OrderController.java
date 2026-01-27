package com.courier.order.controller;

import com.courier.order.dto.CreateOrderRequest;
import com.courier.order.dto.RateOrderRequest;
import com.courier.order.entity.Order;
import com.courier.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
    public ResponseEntity<Page<Order>> getOrders(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "CUSTOMER") String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(orderService.getOrders(userId, role, pageable));
    }

    @GetMapping("/available")
    public ResponseEntity<Page<Order>> getAvailableOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(orderService.getAvailableOrders(pageable));
    }

    @GetMapping("/assigned")
    public ResponseEntity<Page<Order>> getDriverOrders(
            @RequestHeader("X-User-Id") String driverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(orderService.getDriverOrders(driverId, pageable));
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

    @PostMapping("/{id}/rate")
    public ResponseEntity<Order> rateOrder(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody RateOrderRequest request) {
        return ResponseEntity.ok(orderService.rateOrder(id, request.rating(), request.feedback(), userId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Order>> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "CUSTOMER") String role) {
        return ResponseEntity.ok(orderService.getRecentOrderActivities(limit, userId, role));
    }
}