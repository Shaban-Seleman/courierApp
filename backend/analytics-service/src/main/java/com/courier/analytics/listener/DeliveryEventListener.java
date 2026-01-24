package com.courier.analytics.listener;

import com.courier.analytics.config.RabbitMQConfig;
import com.courier.analytics.dto.OrderEventDto;
import com.courier.analytics.entity.CourierStats;
import com.courier.analytics.repository.CourierStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class DeliveryEventListener {

    private final CourierStatsRepository courierStatsRepository;

    @RabbitListener(queues = RabbitMQConfig.ANALYTICS_QUEUE)
    public void handleOrderEvent(OrderEventDto orderEvent) {
        log.info("Analytics received event: {}", orderEvent);

        if ("DELIVERED".equals(orderEvent.status()) && orderEvent.driverId() != null) {
            updateCourierStats(orderEvent.driverId());
        } else if ("PENDING".equals(orderEvent.status()) || "CREATED".equals(orderEvent.status())) {
            // Handle creation metrics if needed
            log.info("Order created: {}", orderEvent.id());
        }
    }

    private void updateCourierStats(UUID driverId) {
        CourierStats stats = courierStatsRepository.findByDriverId(driverId)
                .orElse(CourierStats.builder()
                        .driverId(driverId)
                        .totalDeliveries(0)
                        .averageRating(5.0)
                        .totalEarnings(0.0)
                        .build());

        stats.setTotalDeliveries(stats.getTotalDeliveries() + 1);
        courierStatsRepository.save(stats);
        log.info("Updated stats for driver {}: Total Deliveries = {}", driverId, stats.getTotalDeliveries());
    }
}
