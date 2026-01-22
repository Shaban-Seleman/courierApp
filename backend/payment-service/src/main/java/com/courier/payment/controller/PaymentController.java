package com.courier.payment.controller;

import com.courier.payment.dto.CreatePaymentRequest;
import com.courier.payment.dto.PaymentData;
import com.courier.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentData> createPaymentIntent(@RequestBody CreatePaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPaymentIntent(request));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody String payload) {
        paymentService.handleWebhook(payload);
        return ResponseEntity.ok().build();
    }
}