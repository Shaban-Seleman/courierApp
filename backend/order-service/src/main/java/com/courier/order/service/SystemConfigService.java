package com.courier.order.service;

import com.courier.order.entity.SystemConfig;
import com.courier.order.repository.SystemConfigRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemConfigService {

    private final SystemConfigRepository repository;

    @PostConstruct
    public void init() {
        if (repository.count() == 0) {
            repository.save(new SystemConfig("delivery_base_fee", "5.00", "Base delivery fee in USD"));
            repository.save(new SystemConfig("delivery_per_km", "1.50", "Cost per kilometer in USD"));
            repository.save(new SystemConfig("max_delivery_radius", "50", "Maximum delivery radius in KM"));
            repository.save(new SystemConfig("driver_search_radius", "10", "Radius to search for drivers in KM"));
        }
    }

    public List<SystemConfig> getAllConfigs() {
        return repository.findAll();
    }

    public SystemConfig updateConfig(String key, String value) {
        SystemConfig config = repository.findById(key)
                .orElseThrow(() -> new RuntimeException("Config not found"));
        config.setValue(value);
        return repository.save(config);
    }
    
    public String getConfigValue(String key) {
        return repository.findById(key).map(SystemConfig::getValue).orElse(null);
    }
}
