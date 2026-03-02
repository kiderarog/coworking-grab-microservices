package com.coworking_grab.payment_microservice.Services;

import com.coworking_grab.payment_microservice.Dto.ResponseDTO;
import com.coworking_grab.payment_microservice.Dto.UserBalanceDto;
import com.coworking_grab.payment_microservice.Repositories.BalanceRepository;
import com.coworking_grab.payment_microservice.Security.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
public class BalanceService {
    private final BalanceRepository balanceRepository;

    private final JwtUtil jwtUtil;

    public BalanceService(BalanceRepository balanceRepository, JwtUtil jwtUtil) {
        this.balanceRepository = balanceRepository;
        this.jwtUtil = jwtUtil;

    }

    public void addUser(UUID userId) {
        log.info("Adding user to balance system. userId={}", userId);
        try {
            balanceRepository.addUserIfNotExists(userId);
            log.info("User successfully added to balances(db) userId={}", userId);
        } catch (Exception e) {
            log.error("Failed to add user to balances (Db) userId={}", userId, e);
            throw new RuntimeException("Error while adding user into Payment Database (balances)", e);
        }
        ResponseEntity.ok("User successfully added to Payment Database (balances)");
    }

    public void topUpBalance(UUID userId, BigDecimal amount) {
        log.info("Topping up users balance. userId={}, amount={}", userId, amount);
        try {
        balanceRepository.topUpBalance(userId, amount);
        log.info("Balance successfully updated. userId={}, amount={}", userId, amount);
    } catch (Exception error) {
            log.error("Failed to update balance. userId={}, amount={}", userId, amount, error);
            throw error;
        }
    }

    public ResponseDTO getUserBalance(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Invalid or missing authorization header.");
            return new ResponseDTO("error", "Invalid or missing Authorization header");
        }

        try {
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.parse(token);
            String userId = claims.get("id", String.class);
            log.info("Trying to get user's balance, userId={}", userId);
            BigDecimal balance = balanceRepository.getBalance(UUID.fromString(userId));
            UserBalanceDto userBalanceDto = new UserBalanceDto(balance);
            ResponseDTO response = new ResponseDTO("success", ("User " + userId + " balance was requested from external service"));
            response.setTimestamp(System.currentTimeMillis());
            response.setData(userBalanceDto);
            return response;
        } catch (Exception e) {
            log.error("Failed to get user's balance", e);
            return new ResponseDTO("error", "Unexpected error while getting user's balance");
        }
    }

}
