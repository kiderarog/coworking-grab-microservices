package com.coworking_grab.payment_microservice.Repositories;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.UUID;


@Repository
public class BalanceRepository {
    private final JdbcTemplate jdbc;

    public BalanceRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void addUserIfNotExists(UUID userId) {
        jdbc.update("INSERT INTO balances (user_id, balance) VALUES (?, 0) ON CONFLICT (user_id) DO NOTHING", userId);
    }

    public BigDecimal getBalance(UUID userId) {
        return jdbc.queryForObject("SELECT balance FROM balances WHERE user_id = ?", BigDecimal.class, userId);
    }

    public void topUpBalance(UUID userId, BigDecimal amount) {
         jdbc.update("UPDATE balances SET balance = balance + ?, last_top_up = NOW() " +
                "WHERE user_id = ?", amount, userId);
    }

    public void writeOffBalance(UUID userId, BigDecimal amount) {
        jdbc.update("UPDATE balances SET balance = balance - ?, last_write_off = NOW() " +
                "WHERE user_id = ?", amount, userId);
    }
}
