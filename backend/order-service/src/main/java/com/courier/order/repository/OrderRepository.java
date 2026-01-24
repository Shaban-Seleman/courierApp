package com.courier.order.repository;

import com.courier.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable; // Add this import

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByCustomerId(UUID customerId);
    List<Order> findByDriverId(UUID driverId);
    List<Order> findByStatus(Order.OrderStatus status);
    List<Order> findTopByOrderByCreatedAtDesc(Pageable pageable);
    List<Order> findByOrderByUpdatedAtDesc(Pageable pageable);
    List<Order> findByDriverIdOrderByUpdatedAtDesc(UUID driverId, Pageable pageable);
    List<Order> findByCustomerIdOrderByUpdatedAtDesc(UUID customerId, Pageable pageable);
}

