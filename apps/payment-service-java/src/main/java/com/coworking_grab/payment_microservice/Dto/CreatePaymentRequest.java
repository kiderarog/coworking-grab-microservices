package com.coworking_grab.payment_microservice.Dto;

import lombok.Data;

@Data
public class CreatePaymentRequest {
    private Amount amount;
    private Confirmation confirmation;
    private String description;
    private PaymentMethodData payment_method_data;
    private boolean capture;
    private Metadata metadata;

    @Data
    public static class Amount {
        private String value;
        private String currency;
    }

    @Data
    public static class Confirmation {
        private String type;
        private String return_url;
    }

    @Data
    public static class PaymentMethodData {
        private String type;
    }

    @Data
    public static class Metadata {
        private String userId;
        private String userEmail;
    }
}
