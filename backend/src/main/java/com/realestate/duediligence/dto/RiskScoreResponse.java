// backend/src/main/java/com/realestate/duediligence/dto/RiskScoreResponse.java
package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Risk score for a single property.
 *
 * Score range: 0–100 (higher = more risk).
 * Label:  0–33  → LOW
 *         34–66 → MEDIUM
 *         67–100 → HIGH
 *
 * All scores are computed from real aggregated data — no invented numbers.
 * If a data source is MOCK/UNAVAILABLE, that category gets a moderate
 * uncertainty penalty, not a zero (which would be dishonest).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskScoreResponse {

    private Long propertyId;

    /** Overall weighted risk score 0–100. */
    private int overallScore;

    /** LOW / MEDIUM / HIGH */
    private String riskLabel;

    /** Category breakdown — each 0–100. */
    private int financialScore;
    private int legalScore;
    private int environmentalScore;
    private int structuralScore;

    /** Human-readable flags that drove the score up. */
    private java.util.List<String> riskFlags;

    /** True if any input data came from MOCK/UNAVAILABLE sources. */
    private boolean dataIncomplete;
}