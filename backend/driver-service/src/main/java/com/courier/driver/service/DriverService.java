package com.courier.driver.service;

import com.courier.driver.config.RabbitMQConfig;
import com.courier.driver.dto.DriverProfileRequest;
import com.courier.driver.entity.Driver;
import com.courier.driver.exception.DriverAlreadyExistsException;
import com.courier.driver.exception.DriverNotFoundException;
import com.courier.driver.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DriverService {

    private final DriverRepository driverRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public Driver createProfile(UUID userId, DriverProfileRequest request) {
        if (driverRepository.findByUserId(userId).isPresent()) {
            throw new DriverAlreadyExistsException("Driver profile already exists");
        }

        var driver = Driver.builder()
                .userId(userId)
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

    public Driver getProfile(UUID userId) {
        return driverRepository.findByUserId(userId)
                .orElseThrow(() -> new DriverNotFoundException("Driver not found"));
    }
}
