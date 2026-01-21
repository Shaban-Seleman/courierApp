package com.courier.payment.service;

import com.courier.payment.config.RabbitMQConfig;
import com.courier.payment.dto.CreatePaymentRequest;
import com.courier.payment.entity.Payment;
import com.courier.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public Payment createPaymentIntent(CreatePaymentRequest request) {
        // In a real app, calling Stripe API here to get client_secret
        String mockPaymentIntentId = "pi_" + UUID.randomUUID().toString();

        Payment payment = Payment.builder()
                .orderId(request.orderId())
                .amount(request.amount())
                .currency(request.currency())
                .status("PENDING")
                .paymentIntentId(mockPaymentIntentId)
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional
    public void confirmPayment(String paymentIntentId) {
        Payment payment = paymentRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found for intent: " + paymentIntentId));

        payment.setStatus("COMPLETED");
        paymentRepository.save(payment);
        log.info("Payment confirmed for order: {}", payment.getOrderId());
        
        rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE, "payment.succeeded", payment);
    }
}
