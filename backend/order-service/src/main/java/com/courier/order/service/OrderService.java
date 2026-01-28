package com.courier.order.service;

import com.courier.order.client.UserClient;
import com.courier.order.dto.UserDto;
import com.courier.order.config.RabbitMQConfig;
import com.courier.order.dto.CreateOrderRequest;
import com.courier.order.entity.Order;
import com.courier.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final UserClient userClient;

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
        
        try {
            UserDto driver = userClient.getUserById(driverId);
            if (driver != null) {
                log.info("Fetched driver details: {}", driver);
                order.setDriverName(driver.fullName());
            } else {
                log.warn("Driver details fetched are null for id: {}", driverId);
            }
        } catch (feign.FeignException.NotFound e) {
             log.warn("Driver with ID {} not found in Auth Service. Using default name.", driverId);
             order.setDriverName("Unknown Driver");
        } catch (Exception e) {
            log.error("Failed to fetch driver name for id: {}. Error: {}", driverId, e.getMessage(), e);
        }

        order.setStatus(Order.OrderStatus.ASSIGNED);
        return orderRepository.save(order);
    }

    @Transactional
    public Order updatePoDInfo(UUID orderId, String photoUrl, String signatureUrl) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setPhotoUrl(photoUrl);
        order.setSignatureUrl(signatureUrl);
        order.setStatus(Order.OrderStatus.DELIVERED);
        
        Order updatedOrder = orderRepository.save(order);
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, "order.updated", updatedOrder);
        
        return updatedOrder;
    }

    public List<Order> getOrders(String userId, String role) {
        if ("ADMIN".equals(role)) {
            return orderRepository.findAll(Sort.by("createdAt").descending());
        } else if ("DRIVER".equals(role)) {
            return orderRepository.findByDriverId(UUID.fromString(userId));
        } else {
            return orderRepository.findByCustomerId(UUID.fromString(userId));
        }
    }

    public Page<Order> getOrders(String userId, String role, Pageable pageable) {
        if ("ADMIN".equals(role)) {
            return orderRepository.findAll(pageable);
        } else if ("DRIVER".equals(role)) {
            return orderRepository.findByDriverId(UUID.fromString(userId), pageable);
        } else {
            return orderRepository.findByCustomerId(UUID.fromString(userId), pageable);
        }
    }

    public List<Order> getAvailableOrders() {
        return orderRepository.findByStatus(Order.OrderStatus.PENDING);
    }

    public Page<Order> getAvailableOrders(Pageable pageable) {
        return orderRepository.findByStatus(Order.OrderStatus.PENDING, pageable);
    }

    public List<Order> getDriverOrders(String driverId) {
        return orderRepository.findByDriverId(UUID.fromString(driverId));
    }

    public Page<Order> getDriverOrders(String driverId, Pageable pageable) {
        return orderRepository.findByDriverId(UUID.fromString(driverId), pageable);
    }

    @Transactional
    public Order rateOrder(UUID orderId, Integer rating, String feedback, String customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getCustomerId().equals(UUID.fromString(customerId))) {
            throw new RuntimeException("You can only rate your own orders");
        }

        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new IllegalStateException("Order must be DELIVERED to be rated");
        }

        order.setRating(rating);
        order.setFeedback(feedback);

        Order savedOrder = orderRepository.save(order);
        
        // Publish Event for Analytics
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, "order.rated", savedOrder);
        
        return savedOrder;
    }

    public List<Order> getRecentOrderActivities(int limit, String userId, String role) {
        // Use PageRequest to limit the number of results and sort by updatedAt descending
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by("updatedAt").descending());
        
        if ("ADMIN".equals(role)) {
            return orderRepository.findByOrderByUpdatedAtDesc(pageRequest);
        } else if ("DRIVER".equals(role)) {
            return orderRepository.findByDriverIdOrderByUpdatedAtDesc(UUID.fromString(userId), pageRequest);
        } else {
            return orderRepository.findByCustomerIdOrderByUpdatedAtDesc(UUID.fromString(userId), pageRequest);
        }
    }

    public com.courier.order.dto.OrderStatsResponse getOrderStats(String userId, String role) {
        long pending = 0;
        long assigned = 0;
        long pickedUp = 0;
        long delivered = 0;
        long cancelled = 0;

        if ("ADMIN".equals(role)) {
            pending = orderRepository.countByStatus(Order.OrderStatus.PENDING);
            assigned = orderRepository.countByStatus(Order.OrderStatus.ASSIGNED);
            pickedUp = orderRepository.countByStatus(Order.OrderStatus.PICKED_UP);
            delivered = orderRepository.countByStatus(Order.OrderStatus.DELIVERED);
            cancelled = orderRepository.countByStatus(Order.OrderStatus.CANCELLED);
        } else if ("DRIVER".equals(role)) {
            UUID driverId = UUID.fromString(userId);
            // Drivers usually don't have PENDING orders (unassigned), but checking anyway
            pending = orderRepository.countByDriverIdAndStatus(driverId, Order.OrderStatus.PENDING); 
            assigned = orderRepository.countByDriverIdAndStatus(driverId, Order.OrderStatus.ASSIGNED);
            pickedUp = orderRepository.countByDriverIdAndStatus(driverId, Order.OrderStatus.PICKED_UP);
            delivered = orderRepository.countByDriverIdAndStatus(driverId, Order.OrderStatus.DELIVERED);
            cancelled = orderRepository.countByDriverIdAndStatus(driverId, Order.OrderStatus.CANCELLED);
        } else { // Customer
            UUID customerId = UUID.fromString(userId);
            pending = orderRepository.countByCustomerIdAndStatus(customerId, Order.OrderStatus.PENDING);
            assigned = orderRepository.countByCustomerIdAndStatus(customerId, Order.OrderStatus.ASSIGNED);
            pickedUp = orderRepository.countByCustomerIdAndStatus(customerId, Order.OrderStatus.PICKED_UP);
            delivered = orderRepository.countByCustomerIdAndStatus(customerId, Order.OrderStatus.DELIVERED);
            cancelled = orderRepository.countByCustomerIdAndStatus(customerId, Order.OrderStatus.CANCELLED);
        }
        
        long total = pending + assigned + pickedUp + delivered + cancelled;

        return new com.courier.order.dto.OrderStatsResponse(pending, assigned, pickedUp, delivered, cancelled, total);
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