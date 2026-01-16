package com.courier.analytics.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "courier_scores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourierScore {

    @Id
    private UUID driverId;

    private int totalDeliveries;
    private double averageRating; // Placeholder for future rating logic
    private int onTimeDeliveries;
}
