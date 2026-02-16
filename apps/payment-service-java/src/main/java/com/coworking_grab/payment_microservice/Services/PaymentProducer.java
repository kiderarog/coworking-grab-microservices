package com.coworking_grab.payment_microservice.Services;

import com.coworking_grab.payment_microservice.Config.RabbitConfig;
import com.coworking_grab.payment_microservice.Events.PaymentCreatedEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;


@Service
public class PaymentProducer {
    private final RabbitTemplate rabbitTemplate;

    public PaymentProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendPaymentCreatedEvent(PaymentCreatedEvent event) {

        Map<String, Object> msg = new HashMap<>();
        msg.put("pattern", "payment.created");
        msg.put("data", event);

        rabbitTemplate.convertAndSend(
                RabbitConfig.PAYMENT_EXCHANGE,
                RabbitConfig.PAYMENT_ROUTING_KEY,
                msg);

    }
}