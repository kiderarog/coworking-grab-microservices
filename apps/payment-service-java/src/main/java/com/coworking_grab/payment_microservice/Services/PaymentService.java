package com.coworking_grab.payment_microservice.Services;

import com.coworking_grab.payment_microservice.Dto.CreatePaymentRequest;
import com.coworking_grab.payment_microservice.Dto.WebhookPayload;
import com.coworking_grab.payment_microservice.Events.PaymentCreatedEvent;
import com.coworking_grab.payment_microservice.Exceptions.RabbitMessageSendException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.UUID;

@Service
public class PaymentService {

    @Value("${yookassa.shop-id}")
    private String shopId;

    @Value("${yookassa.secret-key}")
    private String secretKey;

    private final PaymentProducer paymentProducer;
    private final ObjectMapper objectMapper;

    public PaymentService(PaymentProducer paymentProducer, ObjectMapper objectMapper) {
        this.paymentProducer = paymentProducer;
        this.objectMapper = objectMapper;
    }

    public String createPayment(BigDecimal amount, String userId) {

        System.out.println("SHOP ID = " + shopId);
        System.out.println("SECRET = " + secretKey);


        CreatePaymentRequest req = getCreatePaymentRequest(amount, userId);

        String auth = shopId + ":" + secretKey;
        String basicAuth = "Basic " + Base64.getEncoder().encodeToString(auth.getBytes());

        WebClient webClient = WebClient.builder().baseUrl("https://api.yookassa.ru/v3").defaultHeader("Authorization", basicAuth).defaultHeader("Content-Type", "application/json").build();

        String raw = webClient.post().uri("/payments").header("Idempotence-Key", UUID.randomUUID().toString()).bodyValue(req).retrieve().bodyToMono(String.class).block();
        System.out.println(raw);
        return raw;
    }

    private static CreatePaymentRequest getCreatePaymentRequest(BigDecimal amount, String userId) {
        CreatePaymentRequest req = new CreatePaymentRequest();

        CreatePaymentRequest.Amount amt = new CreatePaymentRequest.Amount();
        amt.setValue(amount.toString());
        amt.setCurrency("RUB");

        CreatePaymentRequest.PaymentMethodData pmd = new CreatePaymentRequest.PaymentMethodData();
        pmd.setType("bank_card");

        CreatePaymentRequest.Confirmation cnf = new CreatePaymentRequest.Confirmation();
        cnf.setType("redirect");
        cnf.setReturn_url("http://localhost:4003/payment/success-page");

        CreatePaymentRequest.Metadata metadata = new CreatePaymentRequest.Metadata();
        metadata.setUserId(userId);

        req.setAmount(amt);
        req.setPayment_method_data(pmd);
        req.setConfirmation(cnf);
        req.setDescription("Replenishing the user's balance: " + userId);
        req.setCapture(true);
        req.setMetadata(metadata);
        return req;
    }

    public ResponseEntity<String> receivePaymentWebhookAndSendToRabbitMQ(WebhookPayload webhookPayload) {
        PaymentCreatedEvent event = getPaymentCreatedEvent(webhookPayload);
        String eventToJson = objectMapper.writeValueAsString(event);
        try {
            paymentProducer.sendPaymentCreatedEvent(eventToJson);
            System.out.println("PaymentCreatedEvent sent to RabbitMQ: " + event);

        } catch (Exception e) {
            throw new RabbitMessageSendException("Error while sending message to RabbitMQ", e);
        }

        return ResponseEntity.ok("Webhook processed");
    }

    private static PaymentCreatedEvent getPaymentCreatedEvent(WebhookPayload webhookPayload) {
        try {
            return new PaymentCreatedEvent(
                    webhookPayload.getObject().getId(),
                    new BigDecimal(webhookPayload.getObject().getAmount().getValue()),
                    webhookPayload.getObject().getStatus(),
                    webhookPayload.getObject().getMetadata().getUserId()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error while parsing webhook data", e);
        }
    }


}
