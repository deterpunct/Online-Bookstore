package com.boostore.service.impl;

import com.boostore.entity.Order;
import com.boostore.entity.OrderItem;
import com.boostore.entity.User;
import com.boostore.repository.OrderRepository;
import com.boostore.repository.UserRepository;
import com.boostore.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsServiceImpl implements StatisticsService {

    private static final Logger logger = LoggerFactory.getLogger(StatisticsServiceImpl.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<Map<String, Object>> getBookSales(String startDate, String endDate) {
        try {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);

            logger.info("查询书籍销量统计: {} 到 {}", start, end);
            // 使用枚举类型而不是字符串
            List<Order> orders = orderRepository.findByCreatedAtBetweenAndStatus(start, end, Order.OrderStatus.COMPLETED);
            logger.info("找到 {} 个订单", orders.size());

            // 按书籍分组统计
            Map<Long, Map<String, Object>> bookStats = new HashMap<>();

            for (Order order : orders) {
                if (order.getOrderItems() != null) {
                    for (OrderItem item : order.getOrderItems()) {
                        Long bookId = item.getBook().getId();
                        String bookTitle = item.getBook().getTitle();
                        String bookAuthor = item.getBook().getAuthor();

                        bookStats.computeIfAbsent(bookId, k -> {
                            Map<String, Object> stats = new HashMap<>();
                            stats.put("bookTitle", bookTitle);
                            stats.put("bookAuthor", bookAuthor);
                            stats.put("salesCount", 0);
                            stats.put("totalAmount", 0.0);
                            return stats;
                        });

                        Map<String, Object> stats = bookStats.get(bookId);
                        stats.put("salesCount", (Integer) stats.get("salesCount") + item.getQuantity());
                        stats.put("totalAmount", (Double) stats.get("totalAmount") + item.getSubtotal().doubleValue());
                    }
                }
            }

            List<Map<String, Object>> result = bookStats.values().stream()
                    .sorted((a, b) -> Double.compare((Double) b.get("totalAmount"), (Double) a.get("totalAmount")))
                    .collect(Collectors.toList());

            logger.info("书籍销量统计结果: {} 本书", result.size());
            return result;

        } catch (Exception e) {
            logger.error("获取书籍销量统计失败", e);
            throw new RuntimeException("获取书籍销量统计失败: " + e.getMessage());
        }
    }

    @Override
    public List<Map<String, Object>> getUserConsumption(String startDate, String endDate) {
        try {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);

            logger.info("查询用户消费统计: {} 到 {}", start, end);
            // 使用枚举类型而不是字符串
            List<Order> orders = orderRepository.findByCreatedAtBetweenAndStatus(start, end, Order.OrderStatus.COMPLETED);
            logger.info("找到 {} 个订单", orders.size());

            // 按用户分组统计
            Map<Long, Map<String, Object>> userStats = new HashMap<>();

            for (Order order : orders) {
                Long userId = order.getUser().getId();
                String username = order.getUser().getUsername();

                userStats.computeIfAbsent(userId, k -> {
                    Map<String, Object> stats = new HashMap<>();
                    stats.put("username", username);
                    stats.put("totalAmount", 0.0);
                    stats.put("orderCount", 0);
                    return stats;
                });

                Map<String, Object> stats = userStats.get(userId);
                stats.put("totalAmount", (Double) stats.get("totalAmount") + order.getTotalAmount().doubleValue());
                stats.put("orderCount", (Integer) stats.get("orderCount") + 1);
            }

            List<Map<String, Object>> result = userStats.values().stream()
                    .sorted((a, b) -> Double.compare((Double) b.get("totalAmount"), (Double) a.get("totalAmount")))
                    .collect(Collectors.toList());

            logger.info("用户消费统计结果: {} 个用户", result.size());
            return result;

        } catch (Exception e) {
            logger.error("获取用户消费统计失败", e);
            throw new RuntimeException("获取用户消费统计失败: " + e.getMessage());
        }
    }

    @Override
    public List<Map<String, Object>> getUserStatistics(String startDate, String endDate) {
        try {
            // 获取当前用户
            String username = getCurrentUsername();
            logger.info("获取用户 {} 的个人统计", username);

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("用户不存在"));

            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);

            logger.info("查询用户个人统计: {} 到 {}", start, end);
            // 使用枚举类型而不是字符串
            List<Order> orders = orderRepository.findByUserAndCreatedAtBetweenAndStatus(user, start, end, Order.OrderStatus.COMPLETED);
            logger.info("用户 {} 在指定时间范围内有 {} 个订单", username, orders.size());

            // 按书籍分组统计
            Map<Long, Map<String, Object>> bookStats = new HashMap<>();

            for (Order order : orders) {
                if (order.getOrderItems() != null) {
                    for (OrderItem item : order.getOrderItems()) {
                        Long bookId = item.getBook().getId();
                        String bookTitle = item.getBook().getTitle();

                        bookStats.computeIfAbsent(bookId, k -> {
                            Map<String, Object> stats = new HashMap<>();
                            stats.put("bookTitle", bookTitle);
                            stats.put("quantity", 0);
                            stats.put("totalAmount", 0.0);
                            return stats;
                        });

                        Map<String, Object> stats = bookStats.get(bookId);
                        stats.put("quantity", (Integer) stats.get("quantity") + item.getQuantity());
                        stats.put("totalAmount", (Double) stats.get("totalAmount") + item.getSubtotal().doubleValue());
                    }
                }
            }

            List<Map<String, Object>> result = bookStats.values().stream()
                    .sorted((a, b) -> Integer.compare((Integer) b.get("quantity"), (Integer) a.get("quantity")))
                    .collect(Collectors.toList());

            logger.info("用户个人统计结果: {} 本书", result.size());
            return result;

        } catch (Exception e) {
            logger.error("获取用户个人统计失败", e);
            throw new RuntimeException("获取用户个人统计失败: " + e.getMessage());
        }
    }

    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            return ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }
}