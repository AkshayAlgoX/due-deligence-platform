package com.realestate.duediligence.enums;

/**
 * Categories of risk assessed for a property.
 * Weight = contribution to overall risk score (must sum to 1.0).
 *
 *   FLOOD         25%
 *   LEGAL         20%
 *   TAX           15%
 *   ZONING        15%
 *   ENVIRONMENTAL 15%
 *   MARKET        10%
 */
public enum RiskCategory {
    FLOOD(0.25),
    LEGAL(0.20),
    TAX(0.15),
    ZONING(0.15),
    ENVIRONMENTAL(0.15),
    MARKET(0.10);

    private final double weight;

    RiskCategory(double weight) {
        this.weight = weight;
    }

    public double getWeight() {
        return weight;
    }
}