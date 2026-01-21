package com.courier.payment.controller;

import com.courier.payment.dto.CreatePaymentRequest;
import com.courier.payment.dto.PaymentEvent;
import com.courier.payment.entity.Payment;
import com.courier.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    public ResponseEntity<Payment> createPaymentIntent(@RequestBody CreatePaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPaymentIntent(request));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody PaymentEvent event) {
        log.info("Received Payment Webhook: {}", event);

        if ("payment_intent.succeeded".equals(event.type())) {
            // Mocking extracting paymentIntentId from event.data()
            // In real Stripe event, it's inside data.object.id
            String paymentIntentId = event.data().id(); // Assuming PaymentEvent structure supports this
            if (paymentIntentId != null) {
                paymentService.confirmPayment(paymentIntentId);
            }
        }

        return ResponseEntity.ok("Received");
    }
}
