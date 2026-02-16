package com.coworking_grab.payment_microservice.Controllers;

import com.coworking_grab.payment_microservice.Dto.PaymentDto;
import com.coworking_grab.payment_microservice.Dto.ResponseDTO;
import com.coworking_grab.payment_microservice.Dto.WebhookPayload;
import com.coworking_grab.payment_microservice.Services.BalanceService;
import com.coworking_grab.payment_microservice.Services.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final BalanceService balanceService;


    public PaymentController(PaymentService paymentService, BalanceService balanceService) {
        this.paymentService = paymentService;
        this.balanceService = balanceService;
    }


    @GetMapping("/success-page")
    public String successPayment() {
        return "SUCCESS PAYMENT";
    }


    @PostMapping("/create")
    public ResponseEntity<ResponseDTO> createPayment(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                                     @RequestBody PaymentDto dto) {
        ResponseDTO response = paymentService.createPayment(dto.getAmount(), authHeader);
        if (response.getStatus().equals("error")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    @PostMapping("/webhook")
    public ResponseEntity<ResponseDTO> handleWebhook(@RequestBody WebhookPayload webhookPayload) {
        System.out.println("WEBHOOK RECEIVED" + webhookPayload);
        return paymentService.topUpBalanceAndSendEvent(webhookPayload);
    }

    @GetMapping("/balance")
    public ResponseEntity<ResponseDTO> getUserBalance(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        ResponseDTO response = balanceService.getUserBalance(authHeader);
        if (response.getStatus().equals("error")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


}


