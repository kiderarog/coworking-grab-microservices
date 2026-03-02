package com.coworking_grab.payment_microservice.Services;

import com.coworking_grab.payment_microservice.Config.RabbitConfig;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.InternalException;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Slf4j
@Service
public class AddUserListener {

    private final BalanceService balanceService;
    private final ObjectMapper objectMapper;

    public AddUserListener(BalanceService balanceService, ObjectMapper objectMapper) {
        this.balanceService = balanceService;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = RabbitConfig.USER_CREATED_QUEUE)
    public void handleUserCreatedEvent(Message message) {

        try {
            String incomeMessage = new String(message.getBody(), StandardCharsets.UTF_8);
            log.info("Received user created message: {}", incomeMessage);

            JsonNode root = objectMapper.readTree(incomeMessage);
            JsonNode dataNode = root.get("data");

            if (dataNode == null || dataNode.get("userId") == null) {
                log.error("Invalid user created message, userId missing");
                throw new IllegalArgumentException("UserId is missing in message");
            }

            UUID userId = UUID.fromString(dataNode.get("userId").asString());
            log.info("Adding user to balances. userId={}", userId);
            try {
                balanceService.addUser(userId);
                log.info("User successfully added to balances. userId={}", userId);
            } catch (Exception e) {
                throw new InternalException("Error while adding user to balances DB", e);
            }
        } catch (Exception e) {
            log.error("Error processing user-created event", e);
            throw new RuntimeException("Error processing user created event", e);
        }
    }

}
