package com.boostore.service;

import com.boostore.dto.OrderDto;
import com.boostore.entity.Order;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.boostore.service.impl.OrderServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
public class KafkaConsumerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerService.class);  // 手动创建 logger

    @Autowired
    private OrderServiceImpl orderService;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = "order_to_mysql")
    public void topicListener1(String recordJson, Acknowledgment item) {
        try {
            // 先解析为 JsonNode，以便提取 user.id
            JsonNode jsonNode = objectMapper.readTree(recordJson);
            
            // 提取 userId：优先从 userId 字段，如果没有则从 user.id 提取
            Long userId = null;
            if (jsonNode.has("userId") && !jsonNode.get("userId").isNull()) {
                userId = jsonNode.get("userId").asLong();
            } else if (jsonNode.has("user") && jsonNode.get("user").has("id")) {
                userId = jsonNode.get("user").get("id").asLong();
            }
            
            // 反序列化 Order 对象
            Order record = objectMapper.readValue(recordJson, Order.class);
            
            // 如果 userId 被提取到，设置到 Order 对象
            if (userId != null && record.getUserId() == null) {
                record.setUserId(userId);
            }
            
            log.info("收到订单消息: {}", record);
            log.info("订单 userId 字段: {}, user 对象: {}, user.id: {}", 
                    record.getUserId(), 
                    record.getUser() != null ? "存在" : "null",
                    record.getUser() != null ? record.getUser().getId() : "null");

            OrderDto result = orderService.save_order_mysql(record);
            String resultJson = objectMapper.writeValueAsString(result);
            kafkaTemplate.send("order_response", resultJson);
            
            log.info("订单保存成功，ID: {}", result.getId());
            item.acknowledge();
        } catch (JsonProcessingException e) {
            log.error("订单消息反序列化失败: {}", recordJson, e);
            // 反序列化失败，确认消息避免重复消费
            item.acknowledge();
        } catch (Exception e) {
            log.error("处理订单消息失败: {}", recordJson, e);
            // 业务处理失败，不确认消息，让消息重新消费
            // 如果重试多次仍然失败，可以考虑发送到死信队列
            // item.acknowledge(); // 暂时不确认，让消息重新消费
            throw e; // 抛出异常，让 Kafka 重试机制处理
        }
    }

    @KafkaListener(topics = "order_response")
    public void topicListener2(String recordJson, Acknowledgment item) {
        try {
            OrderDto record = objectMapper.readValue(recordJson, OrderDto.class);

            if (record != null && record.getId() != null) {
                log.info("✅ 订单保存成功 - ID: {}, 用户: {}, 金额: {}",
                        record.getId(), record.getUsername(), record.getTotalAmount());
            } else {
                log.error("❌ 订单保存失败 - 订单信息: {}", record);
            }
            item.acknowledge();
        } catch (JsonProcessingException e) {
            log.error("订单响应消息反序列化失败: {}", recordJson, e);
            item.acknowledge();
        } catch (Exception e) {
            log.error("处理订单响应消息失败: {}", recordJson, e);
            item.acknowledge(); // 响应消息处理失败不影响主流程
        }
    }
}