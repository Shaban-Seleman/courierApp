package com.courier.tracking.service;

import com.courier.tracking.dto.LocationUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TrackingService {

    private final RedisTemplate<String, String> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String GEO_KEY = "driver_locations";

    public void updateLocation(LocationUpdate update) {
        // 1. Update Redis GEO
        redisTemplate.opsForGeo().add(GEO_KEY, new Point(update.longitude(), update.latitude()), update.driverId().toString());

        // 2. Broadcast to specific order topic (for Customer)
        // Topic: /topic/orders/{orderId}
        if (update.orderId() != null) {
            messagingTemplate.convertAndSend("/topic/orders/" + update.orderId(), update);
        }

        // 3. Broadcast to Admin Map (global)
        messagingTemplate.convertAndSend("/topic/admin/map", update);
    }
}
