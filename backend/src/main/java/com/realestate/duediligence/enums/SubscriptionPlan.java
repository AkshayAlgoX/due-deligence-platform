package com.realestate.duediligence.enums;

/**
 * Subscription tiers.
 *
 * Prices in paise (Cashfree uses paise for INR amounts):
 *   FREE      — ₹0
 *   PRO       — ₹499/month  = 49900 paise
 *   BUSINESS  — ₹1,999/month = 199900 paise
 *   ENTERPRISE— custom (contact sales)
 */
public enum SubscriptionPlan {

    FREE(0L, 3),
    PRO(49900L, Integer.MAX_VALUE),
    BUSINESS(199900L, Integer.MAX_VALUE),
    ENTERPRISE(0L, Integer.MAX_VALUE);

    /** Monthly price in paise (0 = free/custom). */
    private final long pricePaise;

    /** Reports allowed per month. */
    private final int monthlyReportLimit;

    SubscriptionPlan(long pricePaise, int monthlyReportLimit) {
        this.pricePaise = pricePaise;
        this.monthlyReportLimit = monthlyReportLimit;
    }

    public long getPricePaise() {
        return pricePaise;
    }

    public int getMonthlyReportLimit() {
        return monthlyReportLimit;
    }

    public static SubscriptionPlan fromName(String name) {
        if (name == null) return FREE;
        try {
            return valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            return FREE;
        }
    }
}
