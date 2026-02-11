package com.coworking_grab.payment_microservice.Exceptions;

public class RabbitMessageSendException extends RuntimeException {

    public RabbitMessageSendException(String message) {
        super(message);
    }

    public RabbitMessageSendException(String message, Throwable cause) {
        super(message, cause);
    }
}
