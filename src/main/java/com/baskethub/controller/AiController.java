package com.baskethub.controller;

import com.baskethub.dto.AiAskRequest;
import com.baskethub.dto.AiResponse;
import com.baskethub.service.AiService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService service;

    public AiController(AiService service) {
        this.service = service;
    }

    @PostMapping("/ask")
    public AiResponse ask(@Valid @RequestBody AiAskRequest req) {
        return new AiResponse(service.ask(req.question()));
    }
}
