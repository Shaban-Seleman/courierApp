package com.courier.driver.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "ORDER-SERVICE", path = "/api/v1/orders")
public interface OrderServiceClient {

    @GetMapping("/available")
    List<Object> getAvailableOrders();

    @GetMapping("/assigned")
    List<Object> getAssignedOrders(@PathVariable("driverId") String driverId);

    @PutMapping("/{id}/status")
    Object updateOrderStatus(@PathVariable("id") UUID id, @RequestParam("status") String status);
}
