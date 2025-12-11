package com.boostore.controller;

import com.boostore.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
public class StatisticsController {

    private static final Logger logger = LoggerFactory.getLogger(StatisticsController.class);

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/book-sales")
    public ResponseEntity<?> getBookSales(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            logger.info("获取书籍销量统计: {} 到 {}", startDate, endDate);
            List<Map<String, Object>> result = statisticsService.getBookSales(startDate, endDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("获取书籍销量统计失败", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "获取书籍销量统计失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user-consumption")
    public ResponseEntity<?> getUserConsumption(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            logger.info("获取用户消费统计: {} 到 {}", startDate, endDate);
            List<Map<String, Object>> result = statisticsService.getUserConsumption(startDate, endDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("获取用户消费统计失败", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "获取用户消费统计失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserStatistics(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            logger.info("获取用户个人统计: {} 到 {}", startDate, endDate);
            List<Map<String, Object>> result = statisticsService.getUserStatistics(startDate, endDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("获取用户个人统计失败", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "获取用户个人统计失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 