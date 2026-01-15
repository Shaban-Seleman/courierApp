package com.courier.payment.controller;

import com.courier.payment.dto.PaymentEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@Slf4j
public class PaymentController {

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody PaymentEvent event) {
        log.info("Received Payment Webhook: {}", event);

        if ("payment_intent.succeeded".equals(event.type())) {
            log.info("Payment Succeeded for Order: {}", event.data().orderId());
            // Here we would call Order Service or publish an event to update status
        }

        return ResponseEntity.ok("Received");
    }
}
