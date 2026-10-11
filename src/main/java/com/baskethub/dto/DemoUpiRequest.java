package com.baskethub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DemoUpiRequest(
        @NotBlank(message = "Please enter your name")
        @Size(max = 100, message = "Name is too long")
        String name,

        @NotBlank(message = "Please enter your phone number")
        @Size(min = 10, max = 15, message = "Phone number must be 10 to 15 digits")
        String phone,

        @NotBlank(message = "Please enter your delivery address")
        @Size(max = 300, message = "Address must be 300 characters or less")
        String address,

        @NotBlank(message = "Please enter your UPI ID")
        @Pattern(regexp = "^[a-zA-Z0-9._-]{2,64}@[a-zA-Z0-9]{2,32}$", message = "UPI ID looks wrong. Example: name@upi")
        String upiId
) {}
