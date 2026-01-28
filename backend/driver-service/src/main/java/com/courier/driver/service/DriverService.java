package com.courier.driver.service;

import com.courier.driver.client.UserClient;
import com.courier.driver.config.RabbitMQConfig;
import com.courier.driver.dto.DriverProfileRequest;
import com.courier.driver.dto.UserDto;
import com.courier.driver.entity.Driver;
import com.courier.driver.exception.DriverAlreadyExistsException;
import com.courier.driver.exception.DriverNotFoundException;
import com.courier.driver.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DriverService {

    private final DriverRepository driverRepository;
    private final RabbitTemplate rabbitTemplate;
    private final UserClient userClient;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String GEO_KEY = "driver_locations";

    @Transactional
    public Driver createProfile(UUID userId, String fullName, DriverProfileRequest request) {
        if (driverRepository.findByUserId(userId).isPresent()) {
            throw new DriverAlreadyExistsException("Driver profile already exists");
        }

        String finalFullName = fullName;
        if (finalFullName == null) {
            try {
                UserDto userDetails = userClient.getUserById(userId);
                if (userDetails != null) {
                    finalFullName = userDetails.fullName();
                    log.info("Fetched fullName from Auth Service for new driver {}: {}", userId, finalFullName);
                } else {
                    log.warn("User details not found for userId {} in Auth Service. Using generic name.", userId);
                    finalFullName = "Driver " + userId.toString().substring(0, 8); // Fallback generic name
                }
            } catch (Exception e) {
                log.error("Error fetching user details from Auth Service for userId {}: {}", userId, e.getMessage());
                finalFullName = "Driver " + userId.toString().substring(0, 8); // Fallback generic name
            }
        }

        var driver = Driver.builder()
                .userId(userId)
                .fullName(finalFullName)
                .vehicleType(request.vehicleType())
                .licensePlate(request.licensePlate())
                .status(Driver.DriverStatus.OFFLINE)
                .build();

        return driverRepository.save(driver);
    }

    @Transactional
    public Driver toggleStatus(UUID userId, Driver.DriverStatus status) {
        var driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new DriverNotFoundException("Driver not found"));
        
        driver.setStatus(status);
        Driver savedDriver = driverRepository.save(driver);

        // Publish event
        rabbitTemplate.convertAndSend(RabbitMQConfig.DRIVER_EXCHANGE, "driver.status.changed", savedDriver);
        log.info("Driver status updated: {} -> {}", userId, status);
        
        return savedDriver;
    }

    public Driver getProfile(UUID userId, String fullName) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new DriverNotFoundException("Driver not found"));

        if (fullName != null && !fullName.isBlank() && !fullName.equals(driver.getFullName())) {
            driver.setFullName(fullName);
            driver = driverRepository.save(driver);
            log.info("Updated driver fullName from header: {}", fullName);
        } else if (driver.getFullName() == null || driver.getFullName().isBlank()) {
            try {
                UserDto userDetails = userClient.getUserById(userId);
                if (userDetails != null) {
                    driver.setFullName(userDetails.fullName());
                    driverRepository.save(driver); // Save updated fullName
                    log.info("Fetched and updated fullName for driver {}: {}", userId, userDetails.fullName());
                } else {
                    log.warn("User details not found for userId {} in Auth Service during getProfile. FullName remains null.", userId);
                }
            } catch (Exception e) {
                log.error("Error fetching user details from Auth Service for userId {} during getProfile: {}", userId, e.getMessage());
            }
        }

        // Retrieve current location from Redis
        try {
            Point driverLocation = redisTemplate.opsForGeo()
                    .position(GEO_KEY, driver.getUserId().toString())
                    .stream().findFirst().orElse(null);

            if (driverLocation != null) {
                driver.setCurrentLatitude(driverLocation.getY());
                driver.setCurrentLongitude(driverLocation.getX());
            }
        } catch (Exception e) {
            log.error("Error retrieving location from Redis for driver {}: {}", driver.getUserId(), e.getMessage());
        }
        return driver;
    }

    public Driver updateProfile(UUID userId, com.courier.driver.dto.UpdateDriverProfileRequest request) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new DriverNotFoundException("Driver not found"));
        
        if (request.vehicleType() != null) driver.setVehicleType(request.vehicleType());
        if (request.licensePlate() != null) driver.setLicensePlate(request.licensePlate());
        if (request.shiftStart() != null) driver.setShiftStart(request.shiftStart());
        if (request.shiftEnd() != null) driver.setShiftEnd(request.shiftEnd());
        
        return driverRepository.save(driver);
    }

    public java.util.List<Driver> getAllDrivers() {
        java.util.List<Driver> drivers = driverRepository.findAll();
        for (Driver driver : drivers) {
            if (driver.getFullName() == null || driver.getFullName().isBlank()) {
                try {
                    UserDto userDetails = userClient.getUserById(driver.getUserId());
                    if (userDetails != null) {
                        driver.setFullName(userDetails.fullName());
                        driverRepository.save(driver); // Save updated fullName
                        log.info("Fetched and updated fullName for driver {}: {}", driver.getUserId(), userDetails.fullName());
                    } else {
                        log.warn("User details not found for userId {} in Auth Service during getAllDrivers. FullName remains null.", driver.getUserId());
                    }
                } catch (Exception e) {
                    log.error("Error fetching user details from Auth Service for userId {} during getAllDrivers: {}", driver.getUserId(), e.getMessage());
                }
            } // Corrected: Added missing closing brace
            // Retrieve current location from Redis
            try {
                Point driverLocation = redisTemplate.opsForGeo()
                        .position(GEO_KEY, driver.getUserId().toString())
                        .stream().findFirst().orElse(null);

                if (driverLocation != null) {
                    driver.setCurrentLatitude(driverLocation.getY());
                    driver.setCurrentLongitude(driverLocation.getX());
                }
            } catch (Exception e) {
                log.error("Error retrieving location from Redis for driver {}: {}", driver.getUserId(), e.getMessage());
            }
        }
        return drivers;
    }
}
