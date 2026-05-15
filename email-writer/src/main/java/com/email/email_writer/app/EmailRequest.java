package com.email.email_writer.app;
import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class EmailRequest {

    @NotBlank(message = "Email content cannot be empty")
    private String emailContent;
   private String tone;
    private String action;
}
