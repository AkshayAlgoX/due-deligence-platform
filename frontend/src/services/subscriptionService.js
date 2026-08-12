import api from "./api";

/**
 * Subscription + Cashfree payment client.
 *
 *   POST /api/subscription/create-order → { paymentSessionId, orderId, ... }
 *   GET  /api/subscription/current      → { plan, planLimit, reportsThisMonth, reportsRemaining, expiresAt, status }
 *   POST /api/subscription/cancel       → { success, message }
 */
const subscriptionService = {
  /** Create a Cashfree order for the given plan. Returns payment_session_id. */
  createOrder(plan) {
    return api.post("/api/subscription/create-order", { plan }).then((r) => r.data);
  },

  /** Current plan + usage for the logged-in user. */
  getCurrent() {
    return api.get("/api/subscription/current").then((r) => r.data);
  },

  /** Cancel the active subscription (access continues until expiry). */
  cancel() {
    return api.post("/api/subscription/cancel").then((r) => r.data);
  },

  /**
   * Verify an order's payment status directly with Cashfree.
   * Backup for the hosted-checkout redirect flow when the webhook lags.
   */
  verifyOrder(orderId) {
    return api
      .get("/api/subscription/verify-order", { params: { orderId } })
      .then((r) => r.data);
  },
};

export default subscriptionService;
