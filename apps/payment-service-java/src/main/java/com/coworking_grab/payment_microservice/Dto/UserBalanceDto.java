package com.coworking_grab.payment_microservice.Dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UserBalanceDto {
    private BigDecimal balance;

    public UserBalanceDto(BigDecimal balance) {
        this.balance = balance;
    }
}
