package com.baskethub.controller;

import com.baskethub.dto.AuthResponse;
import com.baskethub.dto.LoginRequest;
import com.baskethub.dto.RegisterRequest;
import com.baskethub.dto.UserResponse;
import com.baskethub.security.JwtUtil;
import com.baskethub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService service;
    private final JwtUtil jwtUtil;

    public AuthController(UserService service, JwtUtil jwtUtil) {
        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest req) {
        return service.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        UserResponse user = service.login(req);
        String token = jwtUtil.generateToken(user.email(), user.role());
        return new AuthResponse(token, user);
    }
}