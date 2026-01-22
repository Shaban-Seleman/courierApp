package com.courier.order.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String ORDER_CREATED_QUEUE = "order.created.queue";
    public static final String ORDER_UPDATES_QUEUE = "order.updates.queue";
    public static final String ORDER_POD_QUEUE = "order.pod.queue";
    public static final String ORDER_ROUTING_KEY = "order.#";
    public static final String ORDER_DELIVERED_ROUTING_KEY = "order.delivered";
    public static final String POD_UPLOADED_ROUTING_KEY = "order.pod.uploaded";

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    @Bean
    public Queue orderCreatedQueue() {
        return new Queue(ORDER_CREATED_QUEUE);
    }

    @Bean
    public Queue orderUpdatesQueue() {
        return new Queue(ORDER_UPDATES_QUEUE);
    }

    @Bean
    public Queue orderPodQueue() {
        return new Queue(ORDER_POD_QUEUE);
    }

    @Bean
    public Binding binding(Queue orderCreatedQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(orderCreatedQueue)
                .to(orderExchange)
                .with("order.created");
    }

    @Bean
    public Binding updatesBinding(Queue orderUpdatesQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(orderUpdatesQueue)
                .to(orderExchange)
                .with(ORDER_DELIVERED_ROUTING_KEY);
    }

    @Bean
    public Binding podBinding(Queue orderPodQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(orderPodQueue)
                .to(orderExchange)
                .with(POD_UPLOADED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter messageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new Jackson2JsonMessageConverter(objectMapper);
    }
}
