package com.baskethub.config;

import com.baskethub.entity.Product;
import com.baskethub.entity.User;
import com.baskethub.repository.ProductRepository;
import com.baskethub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Runs once at every start-up:
 * 1) If the products table is empty, it adds some sample products.
 * 2) If the environment variable ADMIN_EMAIL is set and a user with that
 *    email is already registered, that user is made ADMIN.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final String adminEmail;

    public DataSeeder(ProductRepository productRepo,
                      UserRepository userRepo,
                      @Value("${ADMIN_EMAIL:}") String adminEmail) {
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.adminEmail = adminEmail == null ? "" : adminEmail.trim();
    }

    @Override
    public void run(String... args) {
        seedProducts();
        promoteAdmin();
    }

    private void seedProducts() {
        if (productRepo.count() > 0) {
            return;
        }
        add("Wireless Earbuds", "Bluetooth earbuds with a charging case and clear sound for calls and music.", "1499", 40, "Electronics");
        add("Power Bank 10000mAh", "Slim power bank with fast charging and two USB ports.", "999", 60, "Electronics");
        add("Smart Fitness Band", "Tracks steps, heart rate and sleep. Water resistant with a 7-day battery.", "1799", 35, "Electronics");
        add("Cotton Casual T-Shirt", "Soft cotton t-shirt for everyday wear. Comfortable regular fit.", "399", 100, "Fashion");
        add("Canvas Backpack", "Sturdy backpack with a laptop pocket, ideal for college and travel.", "799", 50, "Fashion");
        add("Ceramic Coffee Mug Set", "Set of 4 ceramic mugs, microwave and dishwasher safe.", "549", 45, "Home");
        add("LED Desk Lamp", "Adjustable desk lamp with three brightness levels, good for studying.", "699", 30, "Home");
        add("Java Programming Handbook", "Beginner friendly guide to Java with practice questions.", "449", 25, "Books");
        add("Yoga Mat", "Non-slip 6mm yoga mat with a carry strap.", "599", 55, "Sports");
        add("Badminton Racket Pair", "Two lightweight rackets with a carry bag and 3 shuttlecocks.", "899", 20, "Sports");
        System.out.println("DataSeeder: added sample products");
    }

    private void add(String name, String description, String price, int stock, String category) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setPrice(new BigDecimal(price));
        p.setStock(stock);
        p.setCategory(category);
        productRepo.save(p);
    }

    private void promoteAdmin() {
        if (adminEmail.isEmpty()) {
            return;
        }
        Optional<User> found = userRepo.findByEmail(adminEmail);
        if (found.isEmpty()) {
            System.out.println("DataSeeder: ADMIN_EMAIL is set but that user is not registered yet");
            return;
        }
        User user = found.get();
        if (!"ADMIN".equals(user.getRole())) {
            user.setRole("ADMIN");
            userRepo.save(user);
            System.out.println("DataSeeder: user promoted to ADMIN");
        }
    }
}