package com.coworking_grab.payment_microservice.Events;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentCreatedEvent {
    private String paymentId;
    private BigDecimal amount;
    private String status;
    private String userId;

    public PaymentCreatedEvent(String paymentId, BigDecimal amount,
                               String status, String userId) {
        this.paymentId = paymentId;
        this.amount = amount;
        this.status = status;
        this.userId = userId;
    }

}
