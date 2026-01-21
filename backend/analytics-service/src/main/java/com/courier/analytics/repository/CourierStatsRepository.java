package com.courier.analytics.repository;

import com.courier.analytics.entity.CourierStats;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CourierStatsRepository extends JpaRepository<CourierStats, UUID> {
    Optional<CourierStats> findByDriverId(UUID driverId);
}
