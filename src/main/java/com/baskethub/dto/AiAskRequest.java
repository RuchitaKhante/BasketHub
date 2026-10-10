package com.baskethub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiAskRequest(
        @NotBlank(message = "Please type a question")
        @Size(max = 300, message = "Question must be 300 characters or less")
        String question
) {}
