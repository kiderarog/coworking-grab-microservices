package com.coworking_grab.payment_microservice.Controllers;

import com.coworking_grab.payment_microservice.Dto.PaymentDto;
import com.coworking_grab.payment_microservice.Dto.WebhookPayload;

import com.coworking_grab.payment_microservice.Security.JwtUtil;
import com.coworking_grab.payment_microservice.Services.PaymentService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtUtil jwtUtil;


    public PaymentController(PaymentService paymentService, JwtUtil jwtUtil) {
        this.paymentService = paymentService;
        this.jwtUtil = jwtUtil;
    }


    @GetMapping("/success-page")
    public String successPayment() {
        return "SUCCESS PAYMENT";
    }


    @PostMapping("/create")
    public ResponseEntity<String> createPayment(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                                @RequestBody PaymentDto dto) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Invalid or missing Authorization header");
        }
        String token = authHeader.substring(7);
        Claims claims = jwtUtil.parse(token);
        String userId = claims.get("id", String.class);
        return ResponseEntity.ok(paymentService.createPayment(dto.getAmount(), userId));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody WebhookPayload webhookPayload) {
        System.out.println("WEBHOOK RECEIVED" + webhookPayload);
        return paymentService.receivePaymentWebhookAndSendToRabbitMQ(webhookPayload);
        // Нужно добавить логику увеличения баланса (после создания метода в сервисе)
    }


}


