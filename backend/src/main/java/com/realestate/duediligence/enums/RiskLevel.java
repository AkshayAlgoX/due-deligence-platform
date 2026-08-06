package com.realestate.duediligence.enums;

/**
 * Risk severity classification.
 * Score → Level mapping:
 *   0-25   → LOW
 *   26-50  → MEDIUM
 *   51-75  → HIGH
 *   76-100 → CRITICAL
 */
public enum RiskLevel {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL;

    /**
     * Classify a numeric score (0-100) into a RiskLevel bucket.
     */
    public static RiskLevel fromScore(double score) {
        if (score <= 25) return LOW;
        if (score <= 50) return MEDIUM;
        if (score <= 75) return HIGH;
        return CRITICAL;
    }
}