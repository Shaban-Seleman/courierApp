package com.courier.order.controller;

import com.courier.order.entity.SystemConfig;
import com.courier.order.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/config")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService service;

    @GetMapping
    public ResponseEntity<List<SystemConfig>> getConfigs() {
        return ResponseEntity.ok(service.getAllConfigs());
    }

    @PutMapping("/{key}")
    public ResponseEntity<SystemConfig> updateConfig(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        String value = body.get("value");
        return ResponseEntity.ok(service.updateConfig(key, value));
    }
}
