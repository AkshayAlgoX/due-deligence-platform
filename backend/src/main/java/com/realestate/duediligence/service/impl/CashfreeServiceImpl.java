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
        // Use the Payment Links API — POST /links returns link_url, the
        // hosted checkout page URL. (POST /orders does NOT return a
        // payment link in the sandbox; the link is the Stripe-style flow.)
        String linkId = "order_" + UUID.randomUUID().toString().replace("-", "");

        Map<String, Object> payload = Map.of(
                "link_id", linkId,
                "link_amount", plan.getPricePaise() / 100.0,
                "link_currency", "INR",
                "link_purpose", "Subscription: " + plan.name() + " plan",
                "customer_details", Map.of(
                        "customer_email", userEmail,
                        "customer_name", userName,
                        "customer_phone", "9999999999"
                ),
                "link_meta", Map.of(
                        "return_url", "http://localhost:3000/checkout/success?order_id=" + linkId,
                        "notify_url", "http://localhost:8080/api/subscription/webhook"
                )
        );

        try {
            String responseBody = cashfreeClient.post()
                    .uri("/links")
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("[cashfree-create] Link response for {}: {}", linkId, responseBody);

            JsonNode json = objectMapper.readTree(responseBody);
            String linkUrl = json.path("link_url").asText("");
            String returnedLinkId = json.path("link_id").asText(linkId);

            if (linkUrl.isEmpty()) {
                String msg = json.path("message").asText("Cashfree link creation failed");
                return CreateOrderResponse.builder()
                        .success(false)
                        .message(msg)
                        .orderId(returnedLinkId)
                        .plan(plan.name())
                        .amount(plan.getPricePaise())
                        .currency("INR")
                        .build();
            }

            log.info("[cashfree-create] Hosted checkout link ready: {} → {}", returnedLinkId, linkUrl);

            return CreateOrderResponse.builder()
                    .success(true)
                    .paymentSessionId("")
                    .paymentLink(linkUrl)
                    .orderId(returnedLinkId)
                    .plan(plan.name())
                    .amount(plan.getPricePaise())
                    .currency("INR")
                    .build();

        } catch (Exception e) {
            log.error("Cashfree link creation failed for user {}: {}", userId, e.getMessage(), e);
            return CreateOrderResponse.builder()
                    .success(false)
                    .message("Payment gateway error: " + e.getMessage())
                    .orderId(linkId)
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
        String status = getOrderStatus(orderId);
        return "PAID".equalsIgnoreCase(status);
    }

    @Override
    public String getOrderStatus(String orderId) {
        // Primary: Payment Links API — the link_status field is the
        // authoritative state for hosted-checkout payments.
        try {
            String linkBody = cashfreeClient.get()
                    .uri("/links/" + orderId)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("[cashfree-verify] Raw link response for {}: {}", orderId, linkBody);

            JsonNode linkJson = objectMapper.readTree(linkBody);
            if (linkJson.has("link_status")) {
                String linkStatus = linkJson.path("link_status").asText("");
                log.info("[cashfree-verify] Link {} status = '{}' → paid={}", orderId, linkStatus,
                        "PAID".equalsIgnoreCase(linkStatus));
                return linkStatus;
            }
        } catch (Exception e) {
            log.warn("[cashfree-verify] Links API lookup failed for {}: {} — falling back to Orders API",
                    orderId, e.getMessage());
        }

        // Fallback: Orders API (links create an order with link_id as order_id)
        try {
            String responseBody = cashfreeClient.get()
                    .uri("/orders/" + orderId)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("[cashfree-verify] Raw order response for {}: {}", orderId, responseBody);

            JsonNode json = objectMapper.readTree(responseBody);

            // Cashfree error payloads contain a "message" — surface it loudly
            if (json.hasNonNull("message") && !json.has("order_status")) {
                log.warn("[cashfree-verify] Cashfree returned an error for {}: {}", orderId,
                        json.path("message").asText("unknown error"));
                return "";
            }

            String status = json.path("order_status").asText("");

            // Sandbox edge case: order_status sometimes lags behind the actual
            // payment. If any payment on the order is SUCCESS, treat as PAID.
            if (!"PAID".equalsIgnoreCase(status)) {
                JsonNode payments = json.path("payments");
                if (payments != null && payments.isArray()) {
                    for (JsonNode p : payments) {
                        if ("SUCCESS".equalsIgnoreCase(p.path("payment_status").asText(""))) {
                            log.info("[cashfree-verify] Order {} status='{}' but found a SUCCESS payment {} — treating as PAID",
                                    orderId, status, p.path("cf_payment_id").asText(""));
                            return "PAID";
                        }
                    }
                }
            }

            log.info("[cashfree-verify] Order {} status = '{}' → paid={}", orderId, status,
                    "PAID".equalsIgnoreCase(status));
            return status;
        } catch (Exception e) {
            log.error("[cashfree-verify] Order status check failed for {}: {}",
                    orderId, e.getMessage(), e);
            return "";
        }
    }
}
