package com.boostore.service;

import java.util.List;
import java.util.Map;

public interface StatisticsService {
    List<Map<String, Object>> getBookSales(String startDate, String endDate);
    List<Map<String, Object>> getUserConsumption(String startDate, String endDate);
    List<Map<String, Object>> getUserStatistics(String startDate, String endDate);
} 