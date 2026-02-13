package com.coworking_grab.payment_microservice.Services;

import com.coworking_grab.payment_microservice.Dto.ResponseDTO;
import com.coworking_grab.payment_microservice.Dto.UserBalanceDto;
import com.coworking_grab.payment_microservice.Repositories.BalanceRepository;
import com.coworking_grab.payment_microservice.Security.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class BalanceService {
    private final BalanceRepository balanceRepository;

    private final JwtUtil jwtUtil;

    public BalanceService(BalanceRepository balanceRepository, JwtUtil jwtUtil) {
        this.balanceRepository = balanceRepository;
        this.jwtUtil = jwtUtil;

    }

    public void addUser(UUID userId) {
        try {
            balanceRepository.addUserIfNotExists(userId);
        } catch (Exception e) {
            throw new RuntimeException("Error while adding user into Payment Database (balances)");
        }
        ResponseEntity.ok("User successfully added to Payment Database (balances)");
    }

    public void topUpBalance(UUID userId, BigDecimal amount) {
        balanceRepository.topUpBalance(userId, amount);
        System.out.println("Balance of user: " + userId + " successfully updated for " + amount);

    }

    public ResponseDTO getUserBalance(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new ResponseDTO("error", "Invalid or missing Authorization header");
        }

        try {
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.parse(token);
            String userId = claims.get("id", String.class);
            BigDecimal balance = balanceRepository.getBalance(UUID.fromString(userId));
            UserBalanceDto userBalanceDto = new UserBalanceDto(balance);
            ResponseDTO response = new ResponseDTO("success", ("User " + userId + " balance was requested from external service"));
            response.setTimestamp(System.currentTimeMillis());
            response.setData(userBalanceDto);
            return response;
        } catch (Exception e) {
            return new ResponseDTO("error", "Invalid or expired Authorization token");
        }
    }

}
