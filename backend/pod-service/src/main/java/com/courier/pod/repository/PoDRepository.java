package com.courier.pod.repository;

import com.courier.pod.entity.ProofOfDelivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PoDRepository extends JpaRepository<ProofOfDelivery, UUID> {
}
