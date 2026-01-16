package com.courier.analytics.repository;

import com.courier.analytics.entity.CourierScore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CourierScoreRepository extends JpaRepository<CourierScore, UUID> {
}
