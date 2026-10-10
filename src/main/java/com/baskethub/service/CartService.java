package com.baskethub.service;

import com.baskethub.dto.*;
import com.baskethub.entity.CartItem;
import com.baskethub.entity.Product;
import com.baskethub.entity.User;
import com.baskethub.exception.ResourceNotFoundException;
import com.baskethub.repository.CartItemRepository;
import com.baskethub.repository.ProductRepository;
import com.baskethub.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartRepo;
    private final UserRepository userRepo;
    private final ProductRepository productRepo;

    public CartService(CartItemRepository cartRepo, UserRepository userRepo, ProductRepository productRepo) {
        this.cartRepo = cartRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
    }

    public CartResponse getCart(String email) {
        User user = getUser(email);
        List<CartItemResponse> items = cartRepo.findByUser(user).stream()
                .map(this::toResponse)
                .toList();
        BigDecimal total = items.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(items, total);
    }

    public CartResponse addToCart(String email, AddToCartRequest req) {
        User user = getUser(email);
        Product product = productRepo.findById(req.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + req.productId()));

        CartItem item = cartRepo.findByUserAndProduct(user, product).orElseGet(() -> {
            CartItem c = new CartItem();
            c.setUser(user);
            c.setProduct(product);
            c.setQuantity(0);
            return c;
        });

        int newQty = item.getQuantity() + req.quantity();
        checkStock(product, newQty);
        item.setQuantity(newQty);
        cartRepo.save(item);

        return getCart(email);
    }

    public CartResponse updateQuantity(String email, Long itemId, UpdateCartRequest req) {
        User user = getUser(email);
        CartItem item = cartRepo.findByIdAndUser(itemId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        checkStock(item.getProduct(), req.quantity());
        item.setQuantity(req.quantity());
        cartRepo.save(item);

        return getCart(email);
    }

    public CartResponse removeItem(String email, Long itemId) {
        User user = getUser(email);
        CartItem item = cartRepo.findByIdAndUser(itemId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        cartRepo.delete(item);
        return getCart(email);
    }

    private User getUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void checkStock(Product product, int quantity) {
        int stock = product.getStock() == null ? 0 : product.getStock();
        if (quantity > stock) {
            throw new IllegalArgumentException("Only " + stock + " in stock for " + product.getName());
        }
    }

    private CartItemResponse toResponse(CartItem c) {
        Product p = c.getProduct();
        BigDecimal subtotal = p.getPrice().multiply(BigDecimal.valueOf(c.getQuantity()));
        return new CartItemResponse(c.getId(), p.getId(), p.getName(), p.getImageUrl(),
                p.getPrice(), c.getQuantity(), subtotal);
    }
}