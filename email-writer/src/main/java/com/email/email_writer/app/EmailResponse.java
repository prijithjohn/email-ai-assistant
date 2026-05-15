package com.email.email_writer.app;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmailResponse {
    private String reply;
    private String tone;
    private String action;
}