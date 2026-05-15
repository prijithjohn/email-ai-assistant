package com.email.email_writer.app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.model}")
    private String model;

    public EmailGeneratorService(WebClient.Builder builder) {
        this.webClient = builder.build();
    }

    public EmailResponse generateEmailReply(EmailRequest request) {

        String emailContent = request.getEmailContent();
        String tone = (request.getTone() == null || request.getTone().isBlank())
                ? "Professional"
                : request.getTone();

        String action = (request.getAction() == null || request.getAction().isBlank())
                ? "Reply"
                : request.getAction();

        if (emailContent == null) {
            emailContent = "";
        }

        emailContent = emailContent.substring(0, Math.min(2000, emailContent.length()));

        String prompt = buildPrompt(emailContent, tone, action);

        Map<String, Object> body = Map.of(
                "model", model,
                "temperature", 0.6,
                "top_p", 0.9,
                "max_tokens", 400,
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                )
        );

        try {
            String response = webClient.post()
                    .uri(groqApiUrl)
                    .header("Authorization", "Bearer " + groqApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            String reply = extractResponse(response);

            return new EmailResponse(reply, tone, action);

        } catch (Exception e) {
            return new EmailResponse(
                    "Error generating reply. Try again.",
                    tone,
                    action
            );
        }
    }

    // FIXED PROMPT
    private String buildPrompt(String email, String tone, String action) {

        if (email == null || email.isBlank()) {
            email = "NO_EMAIL_PROVIDED";
        }

        return """
            You are an AI Email Assistant inside a production application.

            STRICT RULES:
            - You must generate ONLY the final email output.
            - Do NOT ask for missing information.
            - Do NOT say "please provide email".
            - Do NOT explain anything.
            - Do NOT include subject lines.
            - If email is "NO_EMAIL_PROVIDED", return exactly:
              "ERROR: EMPTY_EMAIL"

            TASK:
            Perform this action: %s

            TONE:
            %s

            ORIGINAL EMAIL:
            %s

            FINAL RULE:
            Return ONLY the email text.
            """.formatted(action, tone, email);
    }

    private String extractResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);

            return root.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText()
                    .trim();

        } catch (Exception e) {
            return "Failed to parse AI response.";
        }
    }
}