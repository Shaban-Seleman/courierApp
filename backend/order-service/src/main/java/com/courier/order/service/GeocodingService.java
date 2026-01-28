package com.courier.order.service;

import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class GeocodingService {

    private final Random random = new Random();

    /**
     * Calculates the distance between two addresses in kilometers.
     * MOCKED: Returns a deterministic random distance based on the hash codes of addresses
     * to ensure the same addresses always yield the same distance for testing.
     */
    public double calculateDistance(String pickupAddress, String deliveryAddress) {
        // Use hash codes to seed logic for deterministic results per address pair
        long seed = pickupAddress.hashCode() + deliveryAddress.hashCode();
        Random deterministicRandom = new Random(seed);
        
        // Generate distance between 1.0 and 25.0 km
        return 1.0 + (24.0 * deterministicRandom.nextDouble());
    }
}
