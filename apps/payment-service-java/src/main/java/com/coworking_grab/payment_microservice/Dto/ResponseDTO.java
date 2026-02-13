package com.coworking_grab.payment_microservice.Dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseDTO {

    private String status;
    private String message;
    private Long timestamp;
    private List<String> errors;
    private Object data;

    public ResponseDTO(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public ResponseDTO(String status, List<String> errors) {
        this.status = status;
        this.errors = errors;
    }

    public ResponseDTO(String message, Long timestamp) {
        this.message = message;
        this.timestamp = timestamp;
    }
}


