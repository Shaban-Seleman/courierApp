package com.courier.auth.service;

import com.courier.auth.config.RabbitMQConfig;
import com.courier.auth.dto.OrderEventDto;
import com.courier.auth.entity.User;
import com.courier.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final UserRepository userRepository;
    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handleOrderEvent(OrderEventDto orderEvent) {
        log.info("Received order event for order: {}", orderEvent.id());

        if (orderEvent.customerId() == null) {
            log.warn("Order event missing customerId, skipping notification.");
            return;
        }

        Optional<User> userOptional = userRepository.findById(orderEvent.customerId());
        if (userOptional.isEmpty()) {
            log.warn("User not found for customerId: {}", orderEvent.customerId());
            return;
        }

        User user = userOptional.get();

        // Check preferences
        if (user.isEmailNotifications()) {
            sendEmailNotification(user, orderEvent);
        } else {
            log.info("Email notifications disabled for user: {}", user.getEmail());
        }
        
        // Future: SMS and Push logic here
    }

    private void sendEmailNotification(User user, OrderEventDto order) {
        String subject = "Order Update: " + order.status();
        String text = "Dear " + user.getFullName() + ",\n\n" +
                      "Your order " + order.id() + " is now " + order.status() + ".\n" +
                      "Pickup: " + order.pickupAddress() + "\n" +
                      "Delivery: " + order.deliveryAddress() + "\n\n" +
                      "Thank you for using CourierApp.";
        
        emailService.sendNotificationEmail(user.getEmail(), subject, text);
    }
}
