package com.baskethub.controller;

import com.baskethub.dto.*;
import com.baskethub.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping("/cod")
    public OrderResponse placeCod(Authentication auth, @Valid @RequestBody CheckoutRequest req) {
        return service.placeCashOnDelivery(auth.getName(), req);
    }

    @PostMapping("/online/start")
    public RazorpayStartResponse startOnline(Authentication auth, @Valid @RequestBody CheckoutRequest req) {
        return service.startOnlinePayment(auth.getName(), req);
    }

    @PostMapping("/online/verify")
    public OrderResponse verifyOnline(Authentication auth, @Valid @RequestBody VerifyPaymentRequest req) {
        return service.verifyOnlinePayment(auth.getName(), req);
    }

    @GetMapping
    public List<OrderResponse> myOrders(Authentication auth) {
        return service.myOrders(auth.getName());
    }
}
