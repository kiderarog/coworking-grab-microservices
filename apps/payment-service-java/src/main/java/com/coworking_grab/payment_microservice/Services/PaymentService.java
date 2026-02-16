package com.coworking_grab.payment_microservice.Services;

import com.coworking_grab.payment_microservice.Dto.CreatePaymentRequest;
import com.coworking_grab.payment_microservice.Dto.ResponseDTO;
import com.coworking_grab.payment_microservice.Dto.WebhookPayload;
import com.coworking_grab.payment_microservice.Events.PaymentCreatedEvent;
import com.coworking_grab.payment_microservice.Exceptions.RabbitMessageSendException;
import com.coworking_grab.payment_microservice.Security.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
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
    private final BalanceService balanceService;
    private final JwtUtil jwtUtil;
    private final RestClient restClient;


    public PaymentService(PaymentProducer paymentProducer, ObjectMapper objectMapper,
                          BalanceService balanceService, JwtUtil jwtUtil,
                          RestClient restClient) {
        this.paymentProducer = paymentProducer;
        this.objectMapper = objectMapper;
        this.balanceService = balanceService;
        this.jwtUtil = jwtUtil;
        this.restClient = restClient;
    }

    public ResponseDTO createPayment(BigDecimal amount, String authHeader) {

        System.out.println("SHOP ID = " + shopId);
        System.out.println("SECRET = " + secretKey);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new ResponseDTO("error", "Invalid or missing Authorization header");
        }

        try {
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.parse(token);
            String userId = claims.get("id", String.class);
            String userEmail = claims.get("email", String.class);

            CreatePaymentRequest req = getCreatePaymentRequest(amount, userId, userEmail);

            String auth = shopId + ":" + secretKey;
            String basicAuth = "Basic " + Base64.getEncoder().encodeToString(auth.getBytes());

            String raw = restClient.post().uri("/payments")
                    .header("Authorization", basicAuth)
                    .header("Idempotence-Key", UUID.randomUUID().toString())
                    .body(req).retrieve().body(String.class);
            Object json = objectMapper.readValue(raw, Object.class);
            ResponseDTO response = new ResponseDTO("success", "Payment created");
            response.setData(json);
            response.setTimestamp(System.currentTimeMillis());
            return response;
        } catch (Exception e) {
            return new ResponseDTO("error", "Error while creating a payment: " + e.getMessage());
        }

    }

    private static CreatePaymentRequest getCreatePaymentRequest(BigDecimal amount, String userId, String userEmail) {
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
        metadata.setUserEmail(userEmail);

        req.setAmount(amt);
        req.setPayment_method_data(pmd);
        req.setConfirmation(cnf);
        req.setDescription("Replenishing the user's balance: " + userId);
        req.setCapture(true);
        req.setMetadata(metadata);
        return req;
    }

    public ResponseEntity<ResponseDTO> topUpBalanceAndSendEvent(WebhookPayload webhookPayload) {
        PaymentCreatedEvent event = getPaymentCreatedEvent(webhookPayload);
        if (!"succeeded".equals(event.getStatus())) {
            ResponseDTO response = new ResponseDTO("error", "Payment status is UNSUCCESSFUL");
            response.setTimestamp(System.currentTimeMillis());
            return ResponseEntity.badRequest().body(response);
        }
        balanceService.topUpBalance(UUID.fromString(event.getUserId()), event.getAmount());
        try {
            paymentProducer.sendPaymentCreatedEvent(event);
            System.out.println("PaymentCreatedEvent sent to RabbitMQ: " + event);

        } catch (Exception e) {
            throw new RabbitMessageSendException("Error while sending message to RabbitMQ", e);
        }

        ResponseDTO response = new ResponseDTO("success", "Webhook processed successfully");
        response.setTimestamp(System.currentTimeMillis());
        response.setData(event);
        return ResponseEntity.ok(response);

    }

    private static PaymentCreatedEvent getPaymentCreatedEvent(WebhookPayload webhookPayload) {
        try {
            return new PaymentCreatedEvent(
                    webhookPayload.getObject().getId(),
                    new BigDecimal(webhookPayload.getObject().getAmount().getValue()),
                    webhookPayload.getObject().getStatus(),
                    webhookPayload.getObject().getMetadata().getUserId(),
                    webhookPayload.getObject().getMetadata().getUserEmail()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error while parsing webhook data", e);
        }
    }


}
