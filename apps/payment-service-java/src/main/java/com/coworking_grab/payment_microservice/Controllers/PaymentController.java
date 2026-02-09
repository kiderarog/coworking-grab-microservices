package com.coworking_grab.payment_microservice.Controllers;

import com.coworking_grab.payment_microservice.Services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

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
    public ResponseEntity<String> createPayment(
            @RequestParam BigDecimal amount,
            @RequestParam String userId
    ) {
        String raw = paymentService.createPayment(amount, userId);
        return ResponseEntity.ok(raw);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String body) {
        System.out.println("WEBHOOK RECEIVED:");
        System.out.println(body);
        return ResponseEntity.ok("OK");
    }

}


