package com.courier.order.listener;

import com.courier.order.config.RabbitMQConfig;
import com.courier.order.entity.Order;
import com.courier.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderEventListener {

    private final OrderService orderService;

    @RabbitListener(queues = RabbitMQConfig.ORDER_UPDATES_QUEUE)
    public void handleOrderDelivered(UUID orderId) {
        log.info("Received delivery confirmation for order: {}", orderId);
        try {
            orderService.updateStatus(orderId, Order.OrderStatus.DELIVERED);
            log.info("Order {} status updated to DELIVERED", orderId);
        } catch (Exception e) {
            log.error("Failed to update status for order: " + orderId, e);
        }
    }
}
