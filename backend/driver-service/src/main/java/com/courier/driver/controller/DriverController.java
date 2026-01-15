package com.courier.driver.controller;

import com.courier.driver.dto.DriverProfileRequest;
import com.courier.driver.entity.Driver;
import com.courier.driver.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @PostMapping("/profile")
    public ResponseEntity<Driver> createProfile(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody DriverProfileRequest request) {
        return ResponseEntity.ok(driverService.createProfile(UUID.fromString(userId), request));
    }

    @GetMapping("/profile")
    public ResponseEntity<Driver> getProfile(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(driverService.getProfile(UUID.fromString(userId)));
    }

    @PutMapping("/status")
    public ResponseEntity<Driver> updateStatus(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam Driver.DriverStatus status) {
        return ResponseEntity.ok(driverService.toggleStatus(UUID.fromString(userId), status));
    }
}
