package com.baskethub.service;

import com.baskethub.dto.*;
import com.baskethub.entity.CartItem;
import com.baskethub.entity.Order;
import com.baskethub.entity.OrderItem;
import com.baskethub.entity.Product;
import com.baskethub.entity.User;
import com.baskethub.exception.ResourceNotFoundException;
import com.baskethub.repository.CartItemRepository;
import com.baskethub.repository.OrderRepository;
import com.baskethub.repository.ProductRepository;
import com.baskethub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final CartItemRepository cartRepo;
    private final UserRepository userRepo;
    private final ProductRepository productRepo;
    private final String keyId;
    private final String keySecret;
    private final RestClient razorpay;

    public OrderService(OrderRepository orderRepo,
                        CartItemRepository cartRepo,
                        UserRepository userRepo,
                        ProductRepository productRepo,
                        @Value("${RAZORPAY_KEY_ID:}") String keyId,
                        @Value("${RAZORPAY_KEY_SECRET:}") String keySecret) {
        this.orderRepo = orderRepo;
        this.cartRepo = cartRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.keyId = keyId == null ? "" : keyId.trim();
        this.keySecret = keySecret == null ? "" : keySecret.trim();

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(20000);
        this.razorpay = RestClient.builder()
                .baseUrl("https://api.razorpay.com/v1")
                .requestFactory(factory)
                .build();
    }

    // ---------- Cash on delivery ----------
    @Transactional
    public OrderResponse placeCashOnDelivery(String email, CheckoutRequest req) {
        User user = getUser(email);
        Order order = buildOrderFromCart(user, req, "COD", "PLACED");
        orderRepo.save(order);
        finishOrder(user, order);
        return toResponse(order);
    }

    // ---------- UPI payment (DEMO: simulated, no real money moves) ----------
    @Transactional
    public OrderResponse placeDemoUpi(String email, DemoUpiRequest req) {
        User user = getUser(email);
        CheckoutRequest details = new CheckoutRequest(req.name(), req.phone(), req.address());
        Order order = buildOrderFromCart(user, details, "UPI_DEMO", "PAID_DEMO");
        orderRepo.save(order);
        finishOrder(user, order);
        return toResponse(order);
    }

    // ---------- Online payment (Razorpay) step 1: create the payment ----------
    @Transactional
    public RazorpayStartResponse startOnlinePayment(String email, CheckoutRequest req) {
        if (keyId.isEmpty() || keySecret.isEmpty()) {
            throw new IllegalArgumentException("Online payment is not set up yet. Please choose Cash on Delivery.");
        }
        User user = getUser(email);
        Order order = buildOrderFromCart(user, req, "ONLINE", "AWAITING_PAYMENT");

        long paise = order.getTotalAmount().multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP).longValueExact();

        Map<String, Object> body = Map.of(
                "amount", paise,
                "currency", "INR",
                "receipt", "BH-" + System.currentTimeMillis());

        String razorpayOrderId;
        try {
            Map<?, ?> res = razorpay.post()
                    .uri("/orders")
                    .headers(h -> h.setBasicAuth(keyId, keySecret))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            Object id = res == null ? null : res.get("id");
            razorpayOrderId = id == null ? null : id.toString();
        } catch (RestClientException e) {
            throw new IllegalArgumentException("Could not start the payment. Please try again.");
        }
        if (razorpayOrderId == null) {
            throw new IllegalArgumentException("Could not start the payment. Please try again.");
        }

        order.setRazorpayOrderId(razorpayOrderId);
        orderRepo.save(order);
        return new RazorpayStartResponse(order.getId(), razorpayOrderId, paise, "INR", keyId);
    }

    // ---------- Online payment step 2: check the payment is real ----------
    @Transactional
    public OrderResponse verifyOnlinePayment(String email, VerifyPaymentRequest req) {
        User user = getUser(email);
        Order order = orderRepo.findByIdAndUser(req.orderId(), user)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!"AWAITING_PAYMENT".equals(order.getStatus())) {
            throw new IllegalArgumentException("This order is already processed");
        }
        if (!req.razorpayOrderId().equals(order.getRazorpayOrderId())) {
            throw new IllegalArgumentException("Payment does not match this order");
        }

        String expected = hmacSha256Hex(req.razorpayOrderId() + "|" + req.razorpayPaymentId(), keySecret);
        boolean valid = MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                req.razorpaySignature().trim().getBytes(StandardCharsets.UTF_8));
        if (!valid) {
            throw new IllegalArgumentException("Payment could not be verified");
        }

        order.setRazorpayPaymentId(req.razorpayPaymentId());
        order.setStatus("PAID");
        finishOrder(user, order);
        return toResponse(order);
    }

    // ---------- My orders ----------
    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(String email) {
        User user = getUser(email);
        return orderRepo.findByUserOrderByCreatedAtDesc(user).stream().map(this::toResponse).toList();
    }

    // ---------- helpers ----------
    private Order buildOrderFromCart(User user, CheckoutRequest req, String method, String status) {
        List<CartItem> cart = cartRepo.findByUser(user);
        if (cart.isEmpty()) {
            throw new IllegalArgumentException("Your basket is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setPaymentMethod(method);
        order.setStatus(status);
        order.setShippingName(req.name().trim());
        order.setShippingPhone(req.phone().trim());
        order.setShippingAddress(req.address().trim());
        order.setCreatedAt(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem c : cart) {
            Product p = c.getProduct();
            checkStock(p, c.getQuantity());

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(p.getId());
            item.setProductName(p.getName());
            item.setPrice(p.getPrice());
            item.setQuantity(c.getQuantity());
            order.getItems().add(item);

            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(c.getQuantity())));
        }
        order.setTotalAmount(total);
        return order;
    }

    // Reduce stock and empty the basket once the order is confirmed
    private void finishOrder(User user, Order order) {
        for (OrderItem item : order.getItems()) {
            Product p = productRepo.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.getProductName()));
            checkStock(p, item.getQuantity());
            p.setStock(p.getStock() - item.getQuantity());
            productRepo.save(p);
        }
        cartRepo.deleteAll(cartRepo.findByUser(user));
        orderRepo.save(order);
    }

    private void checkStock(Product p, int quantity) {
        int stock = p.getStock() == null ? 0 : p.getStock();
        if (quantity > stock) {
            throw new IllegalArgumentException("Only " + stock + " in stock for " + p.getName());
        }
    }

    private User getUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String hmacSha256Hex(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : raw) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Could not check the payment signature");
        }
    }

    private OrderResponse toResponse(Order o) {
        List<OrderItemResponse> items = o.getItems().stream()
                .map(i -> new OrderItemResponse(i.getProductName(), i.getPrice(), i.getQuantity()))
                .toList();
        return new OrderResponse(o.getId(), o.getTotalAmount(), o.getStatus(), o.getPaymentMethod(),
                String.valueOf(o.getCreatedAt()), items);
    }
}
