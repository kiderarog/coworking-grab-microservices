package com.coworking_grab.payment_microservice.Dto;

public class CreatePaymentResponse {
    public String id;
    public String status;
    public boolean paid;
    public Amount amount;
    public Confirmation confirmation;
    public PaymentMethod payment_method;

    public static class Amount {
        public String value;
        public String currency;
    }

    public static class Confirmation {
        public String confirmation_url;
    }

    public static class PaymentMethod {
        public String type;
    }
}
