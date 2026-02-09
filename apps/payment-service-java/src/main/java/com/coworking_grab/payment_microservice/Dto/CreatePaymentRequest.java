package com.coworking_grab.payment_microservice.Dto;

public class CreatePaymentRequest {
    public Amount amount;
    public Confirmation confirmation;
    public String description;
    public PaymentMethodData payment_method_data;
    public boolean capture;

    public static class Amount {
        public String value;
        public String currency;
    }

    public static class Confirmation {
        public String type;
        public String return_url;
    }

    public static class PaymentMethodData {
        public String type;
    }
}
