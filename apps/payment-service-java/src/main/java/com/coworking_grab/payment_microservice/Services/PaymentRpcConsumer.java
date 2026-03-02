package com.coworking_grab.payment_microservice.Services;

import com.coworking_grab.payment_microservice.Config.RabbitConfig;
import com.coworking_grab.payment_microservice.Dto.PaymentResponse;
import com.coworking_grab.payment_microservice.Repositories.BalanceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Slf4j
@Service
public class PaymentRpcConsumer {

    private final ObjectMapper objectMapper;
    private final BalanceRepository balanceRepository;

    public PaymentRpcConsumer(ObjectMapper objectMapper, BalanceRepository balanceRepository) {
        this.objectMapper = objectMapper;
        this.balanceRepository = balanceRepository;
    }

    @RabbitListener(queues = RabbitConfig.BOOKING_INITIALIZATION_QUEUE)
    public PaymentResponse handlePayment(Message message) {
        String incomeMessage =
                new String(message.getBody(), StandardCharsets.UTF_8);
        log.info("Received message from Rabbit MQ Booking initialization queue: {}", incomeMessage);

        JsonNode root = objectMapper.readTree(incomeMessage);
        JsonNode dataNode = root.get("data");
        if (dataNode == null) {
            log.error("Invalid message, 'data' node is missing");
            throw new IllegalArgumentException("Income message is invalid");
        }
        String userId = dataNode.get("userId").asString();
        BigDecimal amount = dataNode.get("amount").decimalValue();
        log.info("Parsed message. userId={}, amount={}", userId, amount);

        BigDecimal balance = balanceRepository.getBalance(UUID.fromString(userId));
        if (balance.compareTo(amount) >= 0) {
            balanceRepository.writeOffBalance(UUID.fromString(userId), amount);
            log.info("Balance successfully written off. userId={}, amount={}", userId, amount);
            return new PaymentResponse("success", userId);

        } else {
            log.warn("Not enough money to write it off for booking. userId={}, balance={}, amount={}", userId, balance, amount);
            return new PaymentResponse("fail", "NOT ENOUGH MONEY", userId);
        }
    }
}
