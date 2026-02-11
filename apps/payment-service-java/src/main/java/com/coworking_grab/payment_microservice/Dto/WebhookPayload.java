package com.coworking_grab.payment_microservice.Dto;

import lombok.Data;

@Data
public class WebhookPayload {
    private String type;
    private String event;
    private ObjectData object;

    @Data
    public static class ObjectData {
        private String id;
        private String status;
        private Amount amount;
        private Recipient recipient;
        private Metadata metadata;
    }

    @Data
    public static class Amount {
        private String value;
        private String currency;
    }

    @Data
    public static class Recipient {
        private String account_id;
        private String gateway_id;
    }

    @Data
    public static class Metadata {
        private String userId;
    }
}


