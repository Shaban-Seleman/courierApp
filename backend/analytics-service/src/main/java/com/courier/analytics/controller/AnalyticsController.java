package com.courier.analytics.controller;

import com.courier.analytics.entity.CourierStats;
import com.courier.analytics.repository.CourierStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final CourierStatsRepository courierStatsRepository;

    @GetMapping("/drivers/{driverId}")
    public ResponseEntity<CourierStats> getDriverStats(@PathVariable UUID driverId) {
        return courierStatsRepository.findByDriverId(driverId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<java.util.List<CourierStats>> getAllStats() {
        return ResponseEntity.ok(courierStatsRepository.findAll());
    }
}
