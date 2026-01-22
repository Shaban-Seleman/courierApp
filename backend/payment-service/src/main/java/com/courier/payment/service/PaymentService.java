package com.courier.payment.service;

import com.courier.payment.config.RabbitMQConfig;
import com.courier.payment.dto.CreatePaymentRequest;
import com.courier.payment.dto.PaymentData;
import com.courier.payment.dto.PaymentEvent;
import com.courier.payment.entity.Payment;
import com.courier.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public PaymentData createPaymentIntent(CreatePaymentRequest request) {
        // Mock Stripe Logic
        String paymentIntentId = "pi_" + UUID.randomUUID().toString();
        String clientSecret = paymentIntentId + "_secret_" + UUID.randomUUID().toString();

        Payment payment = Payment.builder()
                .orderId(request.orderId())
                .amount(request.amount())
                .currency(request.currency())
                .status("PENDING")
                .stripePaymentIntentId(paymentIntentId)
                .build();

        paymentRepository.save(payment);
        log.info("Created payment intent for order: {}", request.orderId());

        return new PaymentData(paymentIntentId, clientSecret, payment.getStatus());
    }

    @Transactional
    public void handleWebhook(String payload) {
        // Mock Webhook Logic - In a real app, parse Stripe signature and JSON
        // Assume payload contains the paymentIntentId and status "succeeded"
        // For this stub, we'll just simulate a success for the most recent PENDING payment
        // OR, simply expect the payload to be the paymentIntentId for simplicity in testing
        
        String paymentIntentId = payload.trim(); // Simplified for stub
        log.info("Received webhook for paymentIntent: {}", paymentIntentId);

        paymentRepository.findByStripePaymentIntentId(paymentIntentId).ifPresent(payment -> {
            payment.setStatus("SUCCEEDED");
            paymentRepository.save(payment);

            // Publish Event
            PaymentEvent event = new PaymentEvent(payment.getOrderId(), payment.getStatus());
            rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE, "payment.succeeded", event);
            log.info("Payment succeeded event published for order: {}", payment.getOrderId());
        });
    }
}