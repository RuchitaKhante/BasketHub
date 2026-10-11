package com.baskethub.dto;

import java.math.BigDecimal;

public record OrderItemResponse(String name, BigDecimal price, Integer quantity) {}
