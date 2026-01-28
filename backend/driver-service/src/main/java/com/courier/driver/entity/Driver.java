package com.courier.driver.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "drivers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID userId; // Links to Auth Service User

    private String fullName;
    private String vehicleType;
    private String licensePlate;

    @Enumerated(EnumType.STRING)
    private DriverStatus status;

    private Double currentLatitude;
    private Double currentLongitude;

    private java.time.LocalTime shiftStart;
    private java.time.LocalTime shiftEnd;

    public enum DriverStatus {
        ONLINE,
        OFFLINE,
        BUSY
    }
}
