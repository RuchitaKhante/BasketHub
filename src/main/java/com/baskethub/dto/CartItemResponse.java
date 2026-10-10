package com.baskethub.dto;

import java.math.BigDecimal;

public record CartItemResponse(Long id, Long productId, String name, String imageUrl,
                               BigDecimal price, Integer quantity, BigDecimal subtotal) {}