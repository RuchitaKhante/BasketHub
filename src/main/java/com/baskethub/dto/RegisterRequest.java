package com.baskethub.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email") String email,
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters") String password
) {}