package com.baskethub.dto;

public record RazorpayStartResponse(Long orderId, String razorpayOrderId, long amountPaise,
                                    String currency, String keyId) {}
