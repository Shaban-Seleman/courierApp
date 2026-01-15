package com.courier.order.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OrderServiceConfig {

    @Bean
    public CommandLineRunner orderServiceStartupRunner() {
        return args -> {
            System.out.println(">>> ORDER SERVICE IS UP AND RUNNING <<<");
        };
    }
}