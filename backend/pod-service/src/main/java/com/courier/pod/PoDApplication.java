package com.courier.pod;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class PoDApplication {
    public static void main(String[] args) {
        SpringApplication.run(PoDApplication.class, args);
    }
}
