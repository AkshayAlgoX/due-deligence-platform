package com.realestate.duediligence.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.duediligence.dto.CreateOrderRequest;
import com.realestate.duediligence.dto.CreateOrderResponse;
import com.realestate.duediligence.entity.Subscription;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.SubscriptionPlan;
import com.realestate.duediligence.repository.DueDiligenceReportRepository;
import com.realestate.duediligence.repository.SubscriptionRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.CashfreeService;
import com.realestate.duediligence.service.EmailService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Subscription + Cashfree payment endpoints.
 *
 *   POST /api/subscription/create-order → create Cashfree order, return payment_session_id
 *   POST /api/subscription/webhook      → Cashfree signed webhook (no auth — signature verified)
 *   GET  /api/subscription/current      → plan + usage for logged-in user
 *   POST /api/subscription/cancel       → mark CANCELLED, send email
 */
@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionController.class);

    private final CashfreeService cashfreeService;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final DueDiligenceReportRepository reportRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    // ── POST /api/subscription/create-order ──────────────────────

    @PostMapping("/create-order")
    public ResponseEntity<CreateOrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {

        User user = requireUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).body(
                CreateOrderResponse.builder().success(false).message("Not authenticated").build());
        }

        SubscriptionPlan plan = SubscriptionPlan.fromName(request.getPlan());
        if (plan == SubscriptionPlan.FREE || plan == SubscriptionPlan.ENTERPRISE) {
            return ResponseEntity.badRequest().body(
                CreateOrderResponse.builder()
                    .success(false)
                    .message("Plan '" + request.getPlan() + "' is not purchasable online. "
                            + "Choose pro or business.")
                    .build());
        }

        CreateOrderResponse response = cashfreeService.createOrder(
                user.getId(), user.getEmail(), user.getFullName(), plan);

        if (!response.isSuccess()) {
            return ResponseEntity.status(502).body(response);
        }

        // Record the pending order as a FAILED subscription row — activated on webhook
        Subscription pending = Subscription.builder()
                .userId(user.getId())
                .plan(plan)
                .status("FAILED")
                .cashfreeOrderId(response.getOrderId())
                .amount(response.getAmount())
                .currency(response.getCurrency())
                .build();
        subscriptionRepository.save(pending);

        return ResponseEntity.ok(response);
    }

    // ── POST /api/subscription/webhook ───────────────────────────

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> webhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = "x-webhook-signature", required = false) String signature) {

        // 1. Verify signature — reject forged payloads outright
        if (!cashfreeService.verifyWebhookSignature(rawPayload, signature)) {
            log.warn("Rejected Cashfree webhook with invalid signature");
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid signature"));
        }

        try {
            JsonNode json = objectMapper.readTree(rawPayload);
            String eventType = json.path("type").asText("");
            String orderId = json.path("data").path("order").path("order_id").asText("");
            String orderStatus = json.path("data").path("order").path("order_status").asText("");
            String paymentId = json.path("data").path("payment").path("cf_payment_id").asText("");

            log.info("Cashfree webhook: type={} order={} status={}", eventType, orderId, orderStatus);

            if (!"PAYMENT_SUCCESS_WEBHOOK".equals(eventType) || !"PAID".equalsIgnoreCase(orderStatus)) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Ignored non-payment event"));
            }

            Subscription sub = subscriptionRepository.findByCashfreeOrderId(orderId).orElse(null);
            if (sub == null) {
                log.warn("Webhook for unknown order {}", orderId);
                return ResponseEntity.ok(Map.of("success", true, "message", "Unknown order"));
            }

            // Activate the subscription
            sub.setStatus("ACTIVE");
            sub.setCashfreePaymentId(paymentId);
            sub.setExpiresAt(LocalDateTime.now().plusMonths(1));
            subscriptionRepository.save(sub);

            log.info("Subscription activated: userId={} plan={} order={}",
                    sub.getUserId(), sub.getPlan(), orderId);

            userRepository.findById(sub.getUserId()).ifPresent(u ->
                emailService.sendWelcomeEmail(u.getEmail(), u.getFullName()));

            return ResponseEntity.ok(Map.of("success", true, "message", "Subscription activated"));

        } catch (Exception e) {
            log.error("Webhook processing failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── GET /api/subscription/current ────────────────────────────

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> current(Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false));
        }

        Subscription sub = subscriptionRepository
                .findFirstByUserIdOrderByCreatedAtDesc(user.getId())
                .orElse(null);

        SubscriptionPlan plan = (sub != null && "ACTIVE".equals(sub.getStatus())
                && sub.getExpiresAt() != null && sub.getExpiresAt().isAfter(LocalDateTime.now()))
                ? sub.getPlan()
                : SubscriptionPlan.FREE;

        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long reportsThisMonth = countReportsThisMonth(user.getId(), monthStart);

        int limit = plan.getMonthlyReportLimit();
        long remaining = Math.max(0, limit - reportsThisMonth);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "plan", plan.name(),
                "planLimit", limit,
                "reportsThisMonth", reportsThisMonth,
                "reportsRemaining", remaining,
                "expiresAt", sub != null && sub.getExpiresAt() != null ? sub.getExpiresAt().toString() : null,
                "status", sub != null ? sub.getStatus() : "NONE"
        ));
    }

    // ── POST /api/subscription/cancel ────────────────────────────

    @PostMapping("/cancel")
    public ResponseEntity<Map<String, Object>> cancel(Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false));
        }

        Subscription sub = subscriptionRepository
                .findFirstByUserIdOrderByCreatedAtDesc(user.getId())
                .orElse(null);

        if (sub == null || !"ACTIVE".equals(sub.getStatus())) {
            return ResponseEntity.ok(Map.of("success", false, "message", "No active subscription"));
        }

        sub.setStatus("CANCELLED");
        sub.setCancelledAt(LocalDateTime.now());
        subscriptionRepository.save(sub);

        try {
            emailService.sendEmail(user.getEmail(), "Subscription cancelled",
                "<p>Your " + sub.getPlan() + " subscription has been cancelled. "
                + "You'll keep access until " + sub.getExpiresAt() + ".</p>",
                "subscription cancellation");
        } catch (Exception ignored) {}

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Subscription cancelled. Access continues until " + sub.getExpiresAt()));
    }

    // ── Helpers ──────────────────────────────────────────────────

    private User requireUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) return null;
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    private long countReportsThisMonth(Long userId, LocalDateTime since) {
        try {
            return reportRepository.countByGeneratedByIdAndCreatedAtAfter(userId, since);
        } catch (Exception e) {
            log.warn("Could not count user reports for plan enforcement: {}", e.getMessage());
            return 0;
        }
    }
}
