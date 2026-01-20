package com.courier.tracking.controller;

import com.courier.tracking.dto.LocationUpdate;
import com.courier.tracking.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller; // Use Controller instead of RestController if mixing, but RestController works for both
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;

    // REST endpoint for HTTP updates
    @PostMapping("/update")
    public ResponseEntity<Void> updateLocationRest(@RequestBody LocationUpdate update) {
        trackingService.updateLocation(update);
        return ResponseEntity.ok().build();
    }

    // WebSocket endpoint for STOMP updates
    @MessageMapping("/courier-location")
    public void updateLocationWs(@Payload LocationUpdate update) {
        trackingService.updateLocation(update);
    }
}
