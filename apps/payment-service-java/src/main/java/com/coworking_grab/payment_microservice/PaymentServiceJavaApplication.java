package com.coworking_grab.payment_microservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;


@Configuration
@SpringBootApplication
public class PaymentServiceJavaApplication {
    private static final Logger log = LoggerFactory.getLogger(PaymentServiceJavaApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceJavaApplication.class, args);
        log.info("Payment-Service (Java) successfully started at: http://localhost:4003");
    }

    @Bean
    public RestClient restClient() {
        return RestClient.builder()
                .baseUrl("https://api.yookassa.ru/v3")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

}
