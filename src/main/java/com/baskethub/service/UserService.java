package com.baskethub.service;

import com.baskethub.dto.LoginRequest;
import com.baskethub.dto.RegisterRequest;
import com.baskethub.dto.UserResponse;
import com.baskethub.entity.User;
import com.baskethub.exception.UnauthorizedException;
import com.baskethub.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.baskethub.exception.ResourceNotFoundException;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    public UserResponse register(RegisterRequest req) {
        if (repo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User();
        user.setName(req.name());
        user.setEmail(req.email());
        user.setPassword(encoder.encode(req.password()));  // hash it
        user.setRole("USER");

        return toResponse(repo.save(user));
    }

    public UserResponse login(LoginRequest req) {
        User user = repo.findByEmail(req.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return toResponse(user);
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole());
    }
    
    public UserResponse getByEmail(String email) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(user);
    }
}