package com.courier.tracking.controller;

import com.courier.tracking.dto.LocationUpdate;
import com.courier.tracking.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final LocationService locationService;

    @PostMapping("/update")
    public ResponseEntity<Void> updateLocationHttp(@RequestBody LocationUpdate update) {
        locationService.updateLocation(update);
        return ResponseEntity.ok().build();
    }

    @MessageMapping("/update")
    public void updateLocationWs(@Payload LocationUpdate update) {
        locationService.updateLocation(update);
    }
}