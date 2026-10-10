package com.baskethub.controller;

import com.baskethub.dto.UserResponse;
import com.baskethub.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return service.getByEmail(authentication.getName());
    }
}