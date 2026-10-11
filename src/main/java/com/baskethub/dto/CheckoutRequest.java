package com.baskethub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CheckoutRequest(
        @NotBlank(message = "Please enter your name")
        @Size(max = 100, message = "Name is too long")
        String name,

        @NotBlank(message = "Please enter your phone number")
        @Size(min = 10, max = 15, message = "Phone number must be 10 to 15 digits")
        String phone,

        @NotBlank(message = "Please enter your delivery address")
        @Size(max = 300, message = "Address must be 300 characters or less")
        String address
) {}
