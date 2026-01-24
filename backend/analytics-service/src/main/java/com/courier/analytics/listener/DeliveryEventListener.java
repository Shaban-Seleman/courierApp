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
            if (orderEvent.rating() != null) {
                updateDriverRating(orderEvent.driverId(), orderEvent.rating());
            } else {
                updateCourierStats(orderEvent.driverId());
            }
        } else if ("PENDING".equals(orderEvent.status()) || "CREATED".equals(orderEvent.status())) {
            log.info("Order created: {}", orderEvent.id());
        }
    }

    private void updateCourierStats(UUID driverId) {
        CourierStats stats = getOrCreateStats(driverId);
        stats.setTotalDeliveries(stats.getTotalDeliveries() + 1);
        // Estimate earnings: $15 per delivery
        stats.setTotalEarnings(stats.getTotalEarnings() + 15.0); 
        courierStatsRepository.save(stats);
        log.info("Updated stats for driver {}: Total Deliveries = {}", driverId, stats.getTotalDeliveries());
    }

    private void updateDriverRating(UUID driverId, Integer newRating) {
        CourierStats stats = getOrCreateStats(driverId);
        
        int currentCount = stats.getTotalRatingsCount() == null ? 0 : stats.getTotalRatingsCount();
        double currentAvg = stats.getAverageRating() == null ? 0.0 : stats.getAverageRating();
        
        double newAvg = ((currentAvg * currentCount) + newRating) / (currentCount + 1);
        
        stats.setAverageRating(newAvg);
        stats.setTotalRatingsCount(currentCount + 1);
        
        courierStatsRepository.save(stats);
        log.info("Updated rating for driver {}: New Avg = {}", driverId, newAvg);
    }

    private CourierStats getOrCreateStats(UUID driverId) {
        return courierStatsRepository.findByDriverId(driverId)
                .orElse(CourierStats.builder()
                        .driverId(driverId)
                        .totalDeliveries(0)
                        .averageRating(0.0)
                        .totalRatingsCount(0)
                        .totalEarnings(0.0)
                        .build());
    }
}
