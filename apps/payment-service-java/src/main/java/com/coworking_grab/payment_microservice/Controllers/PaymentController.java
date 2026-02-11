package com.coworking_grab.payment_microservice.Controllers;

import com.coworking_grab.payment_microservice.Dto.PaymentDto;
import com.coworking_grab.payment_microservice.Dto.WebhookPayload;

import com.coworking_grab.payment_microservice.Services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/success-page")
    public String successPayment() {
        return "SUCCESS PAYMENT";
    }

    @PostMapping("/create")
    public ResponseEntity<String> createPayment(@RequestBody PaymentDto dto) {
        String raw = paymentService.createPayment(dto.getAmount(), dto.getUserId());
        return ResponseEntity.ok(raw);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody WebhookPayload webhookPayload) {
        System.out.println("WEBHOOK RECEIVED" + webhookPayload);
        return paymentService.receivePaymentWebhookAndSendToRabbitMQ(webhookPayload);
    }


}


