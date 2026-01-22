package com.courier.tracking.service;

import com.courier.tracking.dto.LocationUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationService {

    private final RedisTemplate<String, String> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String GEO_KEY = "driver_locations";

    public void updateLocation(LocationUpdate update) {
        // Save to Redis
        redisTemplate.opsForGeo().add(GEO_KEY, new Point(update.longitude(), update.latitude()), update.driverId().toString());
        
        // Broadcast to admin map (all drivers)
        messagingTemplate.convertAndSend("/topic/admin/map", update);

        // Broadcast to specific order (customer tracking)
        if (update.orderId() != null) {
            String destination = "/topic/orders/" + update.orderId();
            messagingTemplate.convertAndSend(destination, update);
        }
        
        log.debug("Updated location for driver {}: {}, {}", update.driverId(), update.latitude(), update.longitude());
    }

    public Point getDriverLocation(UUID driverId) {
        return redisTemplate.opsForGeo()
                .position(GEO_KEY, driverId.toString())
                .stream()
                .findFirst()
                .orElse(null);
    }
}
