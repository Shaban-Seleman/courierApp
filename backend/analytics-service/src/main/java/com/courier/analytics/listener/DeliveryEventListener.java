package com.courier.analytics.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Slf4j
public class DeliveryEventListener {

    @RabbitListener(queues = "order.created.queue") // Ideally strictly speaking we'd have a delivered queue
    public void handleOrderEvent(Object orderData) {
        // In a real app, we'd deserialize to an Order object and update stats
        log.info("Analytics received order event: {}", orderData);
        // Logic: Increment 'total_deliveries' for driver
    }
}
