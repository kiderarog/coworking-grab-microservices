package com.coworking_grab.payment_microservice.Dto;

public class PaymentResponse {
    public String status;
    public String error;
    public String userId;

    public PaymentResponse(String status, String userId) {
        this.status = status;
        this.userId = userId;
    }

    public PaymentResponse(String status, String error, String userId) {
        this.status = status;
        this.error = error;
        this.userId = userId;
    }
}
