package com.coworking_grab.payment_microservice.Services;

import com.coworking_grab.payment_microservice.Config.RabbitConfig;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

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
            String incomeMessage =
                    new String(message.getBody(), StandardCharsets.UTF_8);

            System.out.println("Income message received: " + incomeMessage);

            JsonNode root = objectMapper.readTree(incomeMessage);
            JsonNode dataNode = root.get("data");

            if (dataNode == null || dataNode.get("userId") == null) {
                throw new IllegalArgumentException("UserId is missing in message");
            }

            UUID userId = UUID.fromString(dataNode.get("userId").asString());

            balanceService.addUser(userId);

            System.out.println("User added to balances: " + userId);

        } catch (Exception e) {
            throw new RuntimeException("Error processing user created event", e);
        }
    }

//    @RabbitListener(queues = RabbitConfig.USER_CREATED_QUEUE)
//    public void handleUserCreatedEvent(String incomeMessage) {
//        System.out.println("Income message received: " + incomeMessage);
//
//        try {
//            JsonNode root = objectMapper.readTree(incomeMessage);
//            JsonNode dataNode = root.get("data");
//            if (dataNode == null || dataNode.get("userId") == null) {
//                throw new RuntimeException("UserId is missing in incoming message: " + incomeMessage);
//            }
//            UUID userId = UUID.fromString(dataNode.get("userId").asString());
//            balanceService.addUser(userId);
//            System.out.println("User added to balances: " + userId);
//        } catch (Exception e) {
//            throw new RuntimeException("Error parsing message: " + incomeMessage, e);
//        }
//    }


}
