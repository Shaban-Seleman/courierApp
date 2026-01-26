package com.courier.analytics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "courier_stats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourierStats {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID driverId;

    private String driverName;

    private Integer totalDeliveries;

    private Double averageRating;

    private Integer totalRatingsCount;

    private Double totalEarnings; // Placeholder

    @UpdateTimestamp
    private Instant lastUpdated;
}
