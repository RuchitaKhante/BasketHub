package com.baskethub.controller;

import com.baskethub.dto.*;
import com.baskethub.service.CartService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService service;

    public CartController(CartService service) {
        this.service = service;
    }

    @GetMapping
    public CartResponse getCart(Authentication auth) {
        return service.getCart(auth.getName());
    }

    @PostMapping
    public CartResponse add(Authentication auth, @Valid @RequestBody AddToCartRequest req) {
        return service.addToCart(auth.getName(), req);
    }

    @PutMapping("/{itemId}")
    public CartResponse update(Authentication auth, @PathVariable Long itemId,
                               @Valid @RequestBody UpdateCartRequest req) {
        return service.updateQuantity(auth.getName(), itemId, req);
    }

    @DeleteMapping("/{itemId}")
    public CartResponse remove(Authentication auth, @PathVariable Long itemId) {
        return service.removeItem(auth.getName(), itemId);
    }
}