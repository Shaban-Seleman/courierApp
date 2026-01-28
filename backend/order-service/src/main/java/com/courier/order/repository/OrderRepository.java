package com.courier.order.repository;

import com.courier.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByCustomerId(UUID customerId);
    Page<Order> findByCustomerId(UUID customerId, Pageable pageable);

    List<Order> findByDriverId(UUID driverId);
    Page<Order> findByDriverId(UUID driverId, Pageable pageable);

    List<Order> findByStatus(Order.OrderStatus status);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    List<Order> findTopByOrderByCreatedAtDesc(Pageable pageable);
    List<Order> findByOrderByUpdatedAtDesc(Pageable pageable);
    List<Order> findByDriverIdOrderByUpdatedAtDesc(UUID driverId, Pageable pageable);
    List<Order> findByCustomerIdOrderByUpdatedAtDesc(UUID customerId, Pageable pageable);

    long countByStatus(Order.OrderStatus status);
    long countByCustomerIdAndStatus(UUID customerId, Order.OrderStatus status);
    long countByDriverIdAndStatus(UUID driverId, Order.OrderStatus status);
}

