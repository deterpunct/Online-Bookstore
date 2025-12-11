package com.boostore.controller;

import com.boostore.dto.OrderDto;
import com.boostore.entity.Order;
import com.boostore.service.impl.OrderServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.kafka.core.KafkaTemplate;
import com.boostore.service.impl.UserServiceImpl;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderServiceImpl orderService;

    @Autowired
    private UserServiceImpl userServiceImpl;

    @Autowired
    private KafkaTemplate<Object, String> kafkaTemplate; // ✅ 支持Order

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderDto orderDto) {
        try {
            Order pack_up = orderService.pack_order(orderDto);

            // 使用注入的 ObjectMapper，它会正确应用 @JsonIgnore 注解
            String orderJson = objectMapper.writeValueAsString(pack_up);
            kafkaTemplate.send("order_to_mysql", orderJson);

            Map<String, Object> orderResponse = new HashMap<>();
            // 注意：此时 Order 还未保存到数据库，id 为 null
            // 订单 ID 将在 Kafka 消费者保存后生成
            orderResponse.put("id", null); // 订单 ID 将在保存后生成
            orderResponse.put("status", "created");
            orderResponse.put("totalAmount", pack_up.getTotalAmount());
            orderResponse.put("message", "订单创建成功，数据同步中");

            return ResponseEntity.ok(orderResponse);

        } catch (Exception e) {
            e.printStackTrace(); // 添加详细日志
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<OrderDto>> getUserOrders() {
        List<OrderDto> orders = orderService.getUserOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        List<OrderDto> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        try {
            OrderDto order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            OrderDto updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 