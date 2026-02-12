package com.coworking_grab.payment_microservice.Services;

import com.coworking_grab.payment_microservice.Repositories.BalanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class BalanceService {
    private final BalanceRepository balanceRepository;

    public BalanceService(BalanceRepository balanceRepository) {
        this.balanceRepository = balanceRepository;
    }
    public void addUser (UUID userId) {
        try {
            balanceRepository.addUserIfNotExists(userId);
        } catch (Exception e) {
            throw new RuntimeException("Error while adding user into Payment Database (balances)");
        }
        ResponseEntity.ok("User successfully added to Payment Database (balances)");
    }

}
