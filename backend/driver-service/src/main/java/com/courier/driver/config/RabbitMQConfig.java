package com.courier.driver.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String DRIVER_EXCHANGE = "driver-exchange";

    @Bean
    public TopicExchange driverExchange() {
        return new TopicExchange(DRIVER_EXCHANGE);
    }
}
