package com.coworking_grab.payment_microservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class PaymentServiceJavaApplication {
    private static final Logger log = LoggerFactory.getLogger(PaymentServiceJavaApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceJavaApplication.class, args);
        log.info("Payment-Service (Java) successfully started at: http://localhost:4003");
    }

}
