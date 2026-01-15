package com.courier.tracking.controller;

import com.courier.tracking.dto.LocationUpdate;
import com.courier.tracking.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;

    @PostMapping("/update")
    public ResponseEntity<Void> updateLocation(@RequestBody LocationUpdate update) {
        trackingService.updateLocation(update);
        return ResponseEntity.ok().build();
    }
}
