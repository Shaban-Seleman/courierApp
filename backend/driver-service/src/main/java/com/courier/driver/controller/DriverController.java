package com.courier.driver.controller;

import com.courier.driver.dto.DriverProfileRequest;
import com.courier.driver.entity.Driver;
import com.courier.driver.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    public ResponseEntity<List<Driver>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @PostMapping("/profile")
    public ResponseEntity<Driver> createProfile(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Name") String fullName,
            @RequestBody DriverProfileRequest request) {
        return ResponseEntity.ok(driverService.createProfile(UUID.fromString(userId), fullName, request));
    }

    @GetMapping("/profile")
    public ResponseEntity<Driver> getProfile(@RequestHeader("X-User-Id") String userId, @RequestHeader(value = "X-User-Name", required = false) String fullName) {
        return ResponseEntity.ok(driverService.getProfile(UUID.fromString(userId), fullName));
    }

    @PutMapping("/profile")
    public ResponseEntity<Driver> updateProfile(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody com.courier.driver.dto.UpdateDriverProfileRequest request) {
        return ResponseEntity.ok(driverService.updateProfile(UUID.fromString(userId), request));
    }

    @PutMapping("/status")
    public ResponseEntity<Driver> updateStatus(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam Driver.DriverStatus status) {
        return ResponseEntity.ok(driverService.toggleStatus(UUID.fromString(userId), status));
    }
}
