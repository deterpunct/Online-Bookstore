package com.boostore.service;

import com.boostore.dto.OrderDto;

import java.util.List;

public interface OrderService {
    List<OrderDto> getUserOrders();
    List<OrderDto> getAllOrders();
    OrderDto getOrderById(Long id);
    OrderDto updateOrderStatus(Long id, String status);
} 