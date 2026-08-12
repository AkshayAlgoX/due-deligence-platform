package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.CreateOrderResponse;
import com.realestate.duediligence.enums.SubscriptionPlan;

/**
 * Cashfree Payment Gateway integration (sandbox).
 *
 * Pattern mirrors the reference Gumroad clone:
 *   - HTTP client with x-client-id / x-client-secret / x-api-version headers
 *   - Sandbox base URL: https://sandbox.cashfree.com/pg
 *   - Orders API: POST /orders → returns payment_session_id
 *   - Webhook verification: HMAC-SHA256 over raw payload
 */
public interface CashfreeService {

    /**
     * Creates a Cashfree order and returns the payment_session_id for the
     * drop-in checkout SDK.
     */
    CreateOrderResponse createOrder(Long userId, String userEmail, String userName,
                                    SubscriptionPlan plan);

    /**
     * Verifies the Cashfree webhook signature (x-webhook-signature header).
     * @return true if signature matches (HMAC-SHA256 with webhook secret)
     */
    boolean verifyWebhookSignature(String rawPayload, String signature);

    /** Verifies an order's payment status directly via Cashfree Orders API. */
    boolean isOrderPaid(String orderId);
}
