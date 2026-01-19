package com.courier.order.service;

import com.courier.order.config.RabbitMQConfig;
import com.courier.order.dto.CreateOrderRequest;
import com.courier.order.entity.Order;
import com.courier.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public Order createOrder(CreateOrderRequest request, String customerId) {
        var order = Order.builder()
                .customerId(UUID.fromString(customerId))
                .pickupAddress(request.pickupAddress())
                .deliveryAddress(request.deliveryAddress())
                .packageDescription(request.packageDescription())
                .status(Order.OrderStatus.PENDING)
                .build();

        Order savedOrder = orderRepository.save(order);
        
        // Publish Event
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, "order.created", savedOrder);
        log.info("Order created: {}", savedOrder.getId());
        
        return savedOrder;
    }

    @Transactional
    public Order updateStatus(UUID orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        validateTransition(order.getStatus(), newStatus);
        
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, "order.updated", updatedOrder);
        return updatedOrder;
    }
    
    @Transactional
    public Order assignDriver(UUID orderId, UUID driverId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalStateException("Order must be PENDING to assign driver");
        }

        order.setDriverId(driverId);
        order.setStatus(Order.OrderStatus.ASSIGNED);
        return orderRepository.save(order);
    }

    public List<Order> getMyOrders(String customerId) {
        return orderRepository.findByCustomerId(UUID.fromString(customerId));
    }

    public List<Order> getAvailableOrders() {
        return orderRepository.findByStatus(Order.OrderStatus.PENDING);
    }

    public List<Order> getDriverOrders(String driverId) {
        return orderRepository.findByDriverId(UUID.fromString(driverId));
    }

    private void validateTransition(Order.OrderStatus current, Order.OrderStatus next) {
        if (current == next) {
            return;
        }
        
        if (current == Order.OrderStatus.DELIVERED || current == Order.OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot update terminal state: " + current);
        }

        if (next == Order.OrderStatus.CANCELLED) {
            return; // Can cancel from any non-terminal state
        }

        switch (current) {
            case PENDING:
                if (next != Order.OrderStatus.ASSIGNED) {
                    throw new IllegalStateException("PENDING orders must be ASSIGNED next");
                }
                break;
            case ASSIGNED:
                if (next != Order.OrderStatus.PICKED_UP) {
                    throw new IllegalStateException("ASSIGNED orders must be PICKED_UP next");
                }
                break;
            case PICKED_UP:
                if (next != Order.OrderStatus.DELIVERED) {
                    throw new IllegalStateException("PICKED_UP orders must be DELIVERED next");
                }
                break;
            default:
                throw new IllegalStateException("Invalid state transition from " + current + " to " + next);
        }
    }
}
