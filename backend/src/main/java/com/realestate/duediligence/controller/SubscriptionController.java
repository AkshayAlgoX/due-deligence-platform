package com.realestate.duediligence.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
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
import org.springframework.web.bind.annotation.RequestParam;
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

        SubscriptionPlan plan;
        try {
            plan = SubscriptionPlan.fromName(request.getPlan());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                CreateOrderResponse.builder().success(false)
                    .message("Unknown plan: " + request.getPlan()).build());
        }

        if (plan == SubscriptionPlan.FREE || plan == SubscriptionPlan.ENTERPRISE) {
            return ResponseEntity.badRequest().body(
                CreateOrderResponse.builder()
                    .success(false)
                    .message("Plan '" + request.getPlan() + "' is not purchasable online. "
                            + "Choose pro or business.")
                    .build());
        }

        CreateOrderResponse response;
        try {
            response = cashfreeService.createOrder(
                    user.getId(), user.getEmail(), user.getFullName(), plan);
        } catch (Exception e) {
            log.error("Cashfree order creation crashed: {}", e.getMessage(), e);
            return ResponseEntity.status(502).body(
                CreateOrderResponse.builder().success(false)
                    .message("Payment gateway unavailable. Please try again.").build());
        }

        if (!response.isSuccess()) {
            return ResponseEntity.status(502).body(response);
        }

        // Record the pending order — activated on webhook
        try {
            Subscription pending = Subscription.builder()
                    .userId(user.getId())
                    .plan(plan)
                    .status("PENDING")
                    .cashfreeOrderId(response.getOrderId())
                    .amount(response.getAmount())
                    .currency(response.getCurrency())
                    .build();
            subscriptionRepository.save(pending);
        } catch (Exception e) {
            log.warn("Could not persist pending subscription: {}", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    // ── POST /api/subscription/webhook ───────────────────────────

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> webhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = "x-webhook-signature", required = false) String signature) {

        if (!cashfreeService.verifyWebhookSignature(rawPayload, signature)) {
            log.warn("Rejected Cashfree webhook with invalid signature");
            return ResponseEntity.status(401).body(errorMap("Invalid signature"));
        }

        try {
            JsonNode json = objectMapper.readTree(rawPayload);
            String eventType = json.path("type").asText("");
            String orderId = json.path("data").path("order").path("order_id").asText("");
            String orderStatus = json.path("data").path("order").path("order_status").asText("");
            String paymentId = json.path("data").path("payment").path("cf_payment_id").asText("");

            log.info("Cashfree webhook: type={} order={} status={}", eventType, orderId, orderStatus);

            if (!"PAYMENT_SUCCESS_WEBHOOK".equals(eventType) || !"PAID".equalsIgnoreCase(orderStatus)) {
                return ResponseEntity.ok(successMap("Ignored non-payment event"));
            }

            Subscription sub = subscriptionRepository.findByCashfreeOrderId(orderId).orElse(null);
            if (sub == null) {
                log.warn("Webhook for unknown order {}", orderId);
                return ResponseEntity.ok(successMap("Unknown order"));
            }

            sub.setStatus("ACTIVE");
            sub.setCashfreePaymentId(paymentId);
            sub.setExpiresAt(LocalDateTime.now().plusMonths(1));
            subscriptionRepository.save(sub);

            log.info("Subscription activated: userId={} plan={} order={}",
                    sub.getUserId(), sub.getPlan(), orderId);

            userRepository.findById(sub.getUserId()).ifPresent(u -> {
                try {
                    emailService.sendWelcomeEmail(u.getEmail(), u.getFullName());
                } catch (Exception e) {
                    log.warn("Welcome email failed: {}", e.getMessage());
                }
            });

            return ResponseEntity.ok(successMap("Subscription activated"));

        } catch (Exception e) {
            log.error("Webhook processing failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorMap(e.getMessage()));
        }
    }

    // ── GET /api/subscription/current ────────────────────────────

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> current(Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).body(errorMap("Not authenticated"));
        }

        try {
            Subscription sub = subscriptionRepository
                    .findFirstByUserIdOrderByCreatedAtDesc(user.getId())
                    .orElse(null);

            boolean hasActivePaid = sub != null
                    && "ACTIVE".equals(sub.getStatus())
                    && sub.getExpiresAt() != null
                    && sub.getExpiresAt().isAfter(LocalDateTime.now())
                    && sub.getPlan() != SubscriptionPlan.FREE;

            SubscriptionPlan plan = hasActivePaid ? sub.getPlan() : SubscriptionPlan.FREE;

            LocalDateTime monthStart = LocalDateTime.now()
                    .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            long reportsThisMonth = countReportsThisMonth(user.getId(), monthStart);

            int limit = plan.getMonthlyReportLimit();
            long remaining = limit < 0
                    ? -1  // -1 signals "unlimited" to the frontend
                    : Math.max(0, limit - reportsThisMonth);

            // HashMap tolerates null values — Map.of() crashes on null
            Map<String, Object> body = new HashMap<>();
            body.put("success", true);
            body.put("plan", plan.name());
            body.put("planLimit", limit);
            body.put("reportsThisMonth", reportsThisMonth);
            body.put("reportsRemaining", remaining);
            body.put("expiresAt",
                    hasActivePaid && sub.getExpiresAt() != null
                            ? sub.getExpiresAt().toString()
                            : null);
            body.put("status", sub != null ? sub.getStatus() : "NONE");
            body.put("cashfreeOrderId",
                    hasActivePaid ? sub.getCashfreeOrderId() : null);
            body.put("amount", hasActivePaid ? sub.getAmount() : 0);
            body.put("currency", hasActivePaid ? sub.getCurrency() : "INR");

            return ResponseEntity.ok(body);
        } catch (Exception e) {
            log.error("Failed to load subscription for user {}: {}",
                    user.getId(), e.getMessage(), e);
            return ResponseEntity.status(500).body(errorMap(
                    "Could not load subscription info. Please refresh."));
        }
    }

    // ── GET /api/subscription/verify-order ───────────────────────
    // Backup verification for the hosted-checkout redirect flow.
    // Cashfree webhooks can lag 5-30s, so the success page polls this
    // endpoint until the order is PAID and the subscription is ACTIVE.

    @GetMapping("/verify-order")
    public ResponseEntity<Map<String, Object>> verifyOrder(
            @RequestParam String orderId,
            Authentication authentication) {

        User user = requireUser(authentication);
        if (user == null) {
            log.warn("[subscription-verify] verify-order called without auth for {}", orderId);
            return ResponseEntity.status(401).body(errorMap("Not authenticated"));
        }

        log.info("[subscription-verify] verify-order for {} by userId={}", orderId, user.getId());

        // 1. Already activated by webhook?
        Subscription sub = subscriptionRepository.findByCashfreeOrderId(orderId).orElse(null);
        log.info("[subscription-verify] DB lookup: sub={} status={}",
                sub != null ? sub.getId() : "MISSING",
                sub != null ? sub.getStatus() : "-");

        if (sub != null && "ACTIVE".equals(sub.getStatus())) {
            log.info("[subscription-verify] Already ACTIVE — returning PAID");
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "status", "PAID",
                    "plan", sub.getPlan().name(),
                    "amount", sub.getAmount(),
                    "currency", sub.getCurrency(),
                    "expiresAt", sub.getExpiresAt() != null ? sub.getExpiresAt().toString() : null));
        }

        // 2. Ask Cashfree for the order status
        String cashfreeStatus;
        try {
            cashfreeStatus = cashfreeService.getOrderStatus(orderId);
        } catch (Exception e) {
            log.error("[subscription-verify] verify-order failed for {}: {}", orderId, e.getMessage(), e);
            return ResponseEntity.status(502).body(errorMap("Payment gateway unavailable. Please retry."));
        }

        boolean paid = "PAID".equalsIgnoreCase(cashfreeStatus);

        if (!paid) {
            // Include the raw Cashfree status so the frontend can distinguish
            // "payment still being processed" from "payment never completed"
            log.info("[subscription-verify] Cashfree status '{}' for {} — returning PENDING",
                    cashfreeStatus, orderId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "status", "PENDING",
                    "cashfreeStatus", cashfreeStatus.isEmpty() ? "UNKNOWN" : cashfreeStatus));
        }

        // 3. Paid — activate the subscription (idempotent)
        if (sub == null) {
            log.warn("[subscription-verify] Order {} PAID but no pending row exists", orderId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "status", "PAID",
                    "plan", "UNKNOWN",
                    "amount", 0,
                    "currency", "INR",
                    "expiresAt", null,
                    "note", "Order paid but no pending subscription row found"));
        }

        sub.setStatus("ACTIVE");
        sub.setExpiresAt(LocalDateTime.now().plusMonths(1));
        subscriptionRepository.save(sub);

        log.info("[subscription-verify] Subscription activated: userId={} plan={} order={}",
                sub.getUserId(), sub.getPlan(), orderId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "status", "PAID",
                "plan", sub.getPlan().name(),
                "amount", sub.getAmount(),
                "currency", sub.getCurrency(),
                "expiresAt", sub.getExpiresAt().toString()));
    }

    // ── POST /api/subscription/cancel ────────────────────────────

    @PostMapping("/cancel")
    public ResponseEntity<Map<String, Object>> cancel(Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).body(errorMap("Not authenticated"));
        }

        Subscription sub = subscriptionRepository
                .findFirstByUserIdOrderByCreatedAtDesc(user.getId())
                .orElse(null);

        if (sub == null || !"ACTIVE".equals(sub.getStatus())) {
            Map<String, Object> body = new HashMap<>();
            body.put("success", false);
            body.put("message", "No active subscription to cancel");
            return ResponseEntity.ok(body);
        }

        sub.setStatus("CANCELLED");
        sub.setCancelledAt(LocalDateTime.now());
        subscriptionRepository.save(sub);

        try {
            String expiryText = sub.getExpiresAt() != null
                    ? sub.getExpiresAt().toString()
                    : "the end of your current billing period";
            emailService.sendEmail(user.getEmail(), "Subscription cancelled",
                "<p>Your " + sub.getPlan() + " subscription has been cancelled. "
                + "You'll keep access until " + expiryText + ".</p>",
                "subscription cancellation");
        } catch (Exception e) {
            log.warn("Cancellation email failed: {}", e.getMessage());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Subscription cancelled. Access continues until " +
                (sub.getExpiresAt() != null ? sub.getExpiresAt() : "end of billing period"));
        return ResponseEntity.ok(body);
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

    private Map<String, Object> errorMap(String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("success", false);
        m.put("message", message);
        return m;
    }

    private Map<String, Object> successMap(String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("success", true);
        m.put("message", message);
        return m;
    }
}