package com.email.email_writer.app;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*")
public class EmailController {

    private final EmailGeneratorService service;

    public EmailController(EmailGeneratorService service) {
        this.service = service;
    }

    @PostMapping("/generate")
    public EmailResponse generate(@Valid @RequestBody EmailRequest request) {
        return service.generateEmailReply(request);
    }
}