package com.realestate.duediligence.service.impl;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.duediligence.service.AgentChatService;
import com.realestate.duediligence.service.PropertyService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;
import reactor.util.retry.Retry;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgentChatServiceImpl implements AgentChatService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private final PropertyService propertyService;
    private final ObjectMapper objectMapper;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "openai/gpt-oss-120b";

    @Override
    public Flux<String> streamChat(Long propertyId, String question, List<MessageDto> history) {

        log.info("[AgentChat] Groq key present: {} (length={}, prefix={})",
                groqApiKey != null && !groqApiKey.isBlank(),
                groqApiKey == null ? 0 : groqApiKey.length(),
                groqApiKey == null || groqApiKey.length() < 4
                        ? "null" : groqApiKey.substring(0, 4));

        if (groqApiKey == null || groqApiKey.isBlank()) {
            log.warn("[AgentChat] GROQ_API_KEY not configured");
            return Flux.just("AI assistant is not configured. Please add GROQ_API_KEY to your .env file.");
        }

        String systemPrompt = buildSystemPrompt(propertyId);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        List<MessageDto> trimmedHistory = history != null && history.size() > 10
                ? history.subList(history.size() - 10, history.size())
                : (history != null ? history : List.of());

        for (MessageDto msg : trimmedHistory) {
            String content = msg.content() != null ? msg.content() : "";
            String role = msg.role() != null ? msg.role() : "user";
            messages.add(Map.of("role", role, "content", content));
        }

        messages.add(Map.of("role", "user", "content", question != null ? question : ""));

        Map<String, Object> requestBody = Map.of(
                "model", MODEL,
                "messages", messages,
                "stream", true,
                "max_tokens", 1024,
                "temperature", 0.7
        );

        HttpClient httpClient = HttpClient.create(ConnectionProvider.newConnection())
                .responseTimeout(Duration.ofSeconds(120));

        return WebClient.builder()
                .clientConnector(new org.springframework.http.client.reactive.ReactorClientHttpConnector(httpClient))
                .baseUrl(GROQ_URL)
                .build()
                .post()
                .header("Authorization", "Bearer " + groqApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(HttpStatusCode::isError, resp -> {
                    log.error("[AgentChat] Groq returned HTTP {} — response body follows",
                            resp.statusCode().value());
                    return resp.bodyToMono(String.class)
                            .flatMap(body -> {
                                log.error("[AgentChat] Groq error body: {}", body);
                                return Mono.error(new WebClientResponseException(
                                        "Groq API error: HTTP " + resp.statusCode().value(),
                                        resp.statusCode().value(),
                                        resp.statusCode().toString(),
                                        resp.headers().asHttpHeaders(),
                                        body.getBytes(StandardCharsets.UTF_8),
                                        null));
                            });
                })
                .bodyToFlux(String.class)
                .filter(chunk -> chunk != null && !chunk.isBlank() && !chunk.equals("[DONE]"))
                .mapNotNull(chunk -> {
                    try {
                        String data = chunk.startsWith("data: ") ? chunk.substring(6) : chunk;
                        if (data.equals("[DONE]") || data.isBlank()) return null;
                        JsonNode node = objectMapper.readTree(data);
                        JsonNode delta = node.path("choices").path(0).path("delta").path("content");
                        return delta.isMissingNode() || delta.isNull() ? null : delta.asText();
                    } catch (Exception e) {
                        log.debug("[AgentChat] Skipping non-JSON chunk: {}", chunk);
                        return null;
                    }
                })
                .filter(text -> text != null && !text.isEmpty())
                .timeout(Duration.ofSeconds(120))
                .retryWhen(Retry.backoff(1, Duration.ofMillis(400))
                        .filter(err -> err instanceof WebClientRequestException)
                        .doBeforeRetry(rs -> log.warn("[AgentChat] Retrying Groq call after connection error: {}",
                                rs.failure().getMessage())))
                .doOnError(err -> log.error("[AgentChat] WebClient stream error — FULL STACK:", err))
                .onErrorResume(err -> {
                    log.error("[AgentChat] onErrorResume — FULL STACK:", err);
                    String detail = err.getMessage() != null ? err.getMessage() : err.getClass().getSimpleName();
                    return Flux.just("\n\n[Error: Could not reach AI service. (" + detail + ")]");
                });
    }

    private String buildSystemPrompt(Long propertyId) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert real estate due diligence assistant for Indian properties. ");
        prompt.append("You help buyers, investors, and agents understand property risks clearly and concisely.\n\n");
        prompt.append("Guidelines:\n");
        prompt.append("- Be direct and specific. No fluff.\n");
        prompt.append("- Use bullet points for lists.\n");
        prompt.append("- Cite specific scores and data when available.\n");
        prompt.append("- Flag HIGH and CRITICAL risks prominently.\n");
        prompt.append("- Answer in the language the user asks (English or Hindi).\n");
        prompt.append("- Keep responses under 300 words unless user asks for detail.\n\n");

        if (propertyId != null) {
            try {
                var property = propertyService.getPropertyById(propertyId);
                prompt.append("PROPERTY CONTEXT:\n");
                prompt.append("Address: ").append(property.getAddress()).append("\n");

                if (property.getCity() != null) {
                    prompt.append("City: ").append(property.getCity()).append("\n");
                }
                if (property.getState() != null) {
                    prompt.append("State: ").append(property.getState()).append("\n");
                }
                if (property.getPropertyType() != null) {
                    prompt.append("Type: ").append(property.getPropertyType()).append("\n");
                }
                if (property.getArea() != null) {
                    prompt.append("Area: ").append(property.getArea()).append(" sq ft\n");
                }
                if (property.getMarketValue() != null) {
                    prompt.append("Market Value: ₹").append(property.getMarketValue()).append("\n");
                }
                if (property.getYearBuilt() != null) {
                    prompt.append("Year Built: ").append(property.getYearBuilt()).append("\n");
                }
                if (property.getZoning() != null) {
                    prompt.append("Zoning: ").append(property.getZoning()).append("\n");
                }
                if (property.getCondition() != null) {
                    prompt.append("Condition: ").append(property.getCondition()).append("\n");
                }
                if (property.getVerified() != null) {
                    prompt.append("Verified: ").append(property.getVerified() ? "Yes" : "No").append("\n");
                }
                if (property.getMissingFields() != null && !property.getMissingFields().isEmpty()) {
                    prompt.append("Missing Data Fields: ").append(String.join(", ", property.getMissingFields())).append("\n");
                }
                prompt.append("\n");

            } catch (Exception e) {
                log.warn("[AgentChat] Could not load property {}: {}", propertyId, e.getMessage());
                prompt.append("(Property details unavailable — answer general due diligence questions)\n\n");
            }
        } else {
            prompt.append("You are in general mode. Answer general real estate due diligence questions for Indian properties.\n\n");
        }

        prompt.append("If asked something outside real estate due diligence, politely redirect to property topics.");
        return prompt.toString();
    }
}