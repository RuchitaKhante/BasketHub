package com.baskethub.dto;

import java.math.BigDecimal;
import java.util.List;

public record OrderResponse(Long id, BigDecimal total, String status, String paymentMethod,
                            String createdAt, List<OrderItemResponse> items) {}
