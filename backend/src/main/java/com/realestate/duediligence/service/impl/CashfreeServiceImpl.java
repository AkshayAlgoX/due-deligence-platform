package com.realestate.duediligence.service.impl;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.duediligence.dto.CreateOrderResponse;
import com.realestate.duediligence.enums.SubscriptionPlan;

/**
 * Cashfree sandbox integration.
 *
 * Follows the reference project's pattern: static headers (x-client-id,
 * x-client-secret, x-api-version 2023-08-01) against sandbox.cashfree.com/pg.
 * No credentials are ever exposed to the browser — the frontend only receives
 * a payment_session_id.
 */
@Service
public class CashfreeServiceImpl implements com.realestate.duediligence.service.CashfreeService {

    private static final Logger log = LoggerFactory.getLogger(CashfreeServiceImpl.class);

    private final WebClient cashfreeClient;
    private final ObjectMapper objectMapper;

    @Value("${cashfree.webhook-secret:}")
    private String webhookSecret;

    public CashfreeServiceImpl(
            @Value("${cashfree.app-id:}") String appId,
            @Value("${cashfree.secret-key:}") String secretKey,
            @Value("${cashfree.environment:sandbox}") String environment,
            ObjectMapper objectMapper) {

        this.objectMapper = objectMapper;

        String baseUrl = "production".equalsIgnoreCase(environment)
                ? "https://api.cashfree.com/pg"
                : "https://sandbox.cashfree.com/pg";

        this.cashfreeClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("x-client-id", appId)
                .defaultHeader("x-client-secret", secretKey)
                .defaultHeader("x-api-version", "2023-08-01")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public CreateOrderResponse createOrder(Long userId, String userEmail, String userName,
                                           SubscriptionPlan plan) {
        String orderId = "order_" + UUID.randomUUID().toString().replace("-", "");

        Map<String, Object> payload = Map.of(
                "order_id", orderId,
                "order_amount", plan.getPricePaise() / 100.0,   // Cashfree accepts rupees with paise decimals
                "order_currency", "INR",
                "order_note", "Subscription: " + plan.name() + " plan",
                "customer_details", Map.of(
                        "customer_id", String.valueOf(userId),
                        "customer_email", userEmail,
                        "customer_name", userName,
                        "customer_phone", "9999999999"
                ),
                "order_meta", Map.of(
                        "return_url", "http://localhost:3000/checkout/success?order_id=" + orderId,
                        "notify_url", "http://localhost:8080/api/subscription/webhook"
                )
        );

        try {
            String responseBody = cashfreeClient.post()
                    .uri("/orders")
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Cashfree create-order response: {}", responseBody);

            JsonNode json = objectMapper.readTree(responseBody);
            String paymentSessionId = json.path("payment_session_id").asText("");
            String returnedOrderId = json.path("order_id").asText(orderId);
            String paymentLink = json.path("payment_link").asText("");

            if (paymentSessionId.isEmpty() && paymentLink.isEmpty()) {
                String msg = json.path("message").asText("Cashfree order creation failed");
                return CreateOrderResponse.builder()
                        .success(false)
                        .message(msg)
                        .orderId(returnedOrderId)
                        .plan(plan.name())
                        .amount(plan.getPricePaise())
                        .currency("INR")
                        .build();
            }

            return CreateOrderResponse.builder()
                    .success(true)
                    .paymentSessionId(paymentSessionId)
                    .paymentLink(paymentLink)
                    .orderId(returnedOrderId)
                    .plan(plan.name())
                    .amount(plan.getPricePaise())
                    .currency("INR")
                    .build();

        } catch (Exception e) {
            log.error("Cashfree order creation failed for user {}: {}", userId, e.getMessage(), e);
            return CreateOrderResponse.builder()
                    .success(false)
                    .message("Payment gateway error: " + e.getMessage())
                    .orderId(orderId)
                    .plan(plan.name())
                    .amount(plan.getPricePaise())
                    .currency("INR")
                    .build();
        }
    }

    @Override
    public boolean verifyWebhookSignature(String rawPayload, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("Cashfree webhook secret not configured — signature verification skipped");
            return true; // dev-mode: no secret configured → accept (sandbox convenience)
        }
        if (signature == null || signature.isBlank()) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(rawPayload.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString().equalsIgnoreCase(signature);
        } catch (Exception e) {
            log.error("Webhook signature verification failed: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean isOrderPaid(String orderId) {
        try {
            String responseBody = cashfreeClient.get()
                    .uri("/orders/" + orderId)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode json = objectMapper.readTree(responseBody);
            String status = json.path("order_status").asText("");
            return "PAID".equalsIgnoreCase(status);
        } catch (Exception e) {
            log.error("Cashfree order status check failed for {}: {}", orderId, e.getMessage());
            return false;
        }
    }
}
