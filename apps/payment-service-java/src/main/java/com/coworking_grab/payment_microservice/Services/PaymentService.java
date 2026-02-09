package com.coworking_grab.payment_microservice.Services;

import com.coworking_grab.payment_microservice.Dto.CreatePaymentRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.UUID;

@Service
public class PaymentService {

    @Value("${yookassa.shop-id}")
    private String shopId;

    @Value("${yookassa.secret-key}")
    private String secretKey;



    public String createPayment(BigDecimal amount, String userId) {

        System.out.println("SHOP ID = " + shopId);
        System.out.println("SECRET = " + secretKey);


        CreatePaymentRequest req = new CreatePaymentRequest();

        CreatePaymentRequest.Amount amt = new CreatePaymentRequest.Amount();
        amt.value = amount.toString();
        amt.currency = "RUB";

        CreatePaymentRequest.PaymentMethodData pmd = new CreatePaymentRequest.PaymentMethodData();
        pmd.type = "bank_card";

        CreatePaymentRequest.Confirmation cnf = new CreatePaymentRequest.Confirmation();
        cnf.type = "redirect";
        cnf.return_url = "http://localhost:4003/payment/success-page";

        req.amount = amt;
        req.payment_method_data = pmd;
        req.confirmation = cnf;
        req.description = "Replenishing the user's balance: " + userId;
        req.capture = true;

        String auth = shopId + ":" + secretKey;
        String basicAuth = "Basic " + Base64.getEncoder().encodeToString(auth.getBytes());

        WebClient webClient = WebClient.builder()
                .baseUrl("https://api.yookassa.ru/v3")
                .defaultHeader("Authorization", basicAuth)
                .defaultHeader("Content-Type", "application/json")
                .build();

        String raw =  webClient.post()
                .uri("/payments")
                .header("Idempotence-Key", UUID.randomUUID().toString())
                .bodyValue(req)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        System.out.println(raw);
        return raw;
    }
}
