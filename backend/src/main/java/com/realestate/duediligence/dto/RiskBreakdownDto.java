// backend/src/main/java/com/realestate/duediligence/dto/RiskBreakdownDto.java
package com.realestate.duediligence.dto;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.realestate.duediligence.enums.RiskLevel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Full per-category breakdown for one risk assessment.
 *
 * Used by GET /api/properties/{propertyId}/risk/breakdown
 *
 * Contains everything needed for the radar chart + factor cards:
 * - All 6 category scores
 * - Full factor list with explanations
 * - Data quality metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RiskBreakdownDto {

    private Long propertyId;
    private Long assessmentId;

    /** Overall weighted score 0–100. */
    private double overallScore;
    private RiskLevel overallLevel;

    // ── Per-category scores (0–100 each) ─────────────────────────

    /** FLOOD — weight 25% */
    private double floodScore;

    /** LEGAL (ownership + registration) — weight 20% */
    private double legalScore;

    /** TAX — weight 15% */
    private double taxScore;

    /** ZONING — weight 15% */
    private double zoningScore;

    /** ENVIRONMENTAL (AQI + soil + noise) — weight 15% */
    private double environmentalScore;

    /** MARKET (property age, condition, verified status) — weight 10% */
    private double marketScore;

    // ── Full factor details ───────────────────────────────────────

    /**
     * One entry per RiskCategory — contains score, explanation, recommendation.
     * Ordered by score DESC (highest risk first).
     */
    private List<RiskFactorDto> factors;

    // ── Data quality ──────────────────────────────────────────────

    /**
     * True if any category used MOCK/UNAVAILABLE data.
     * Frontend shows a data quality warning banner when true.
     */
    private boolean dataIncomplete;

    /**
     * Count of providers that returned UNAVAILABLE/TIMEOUT/ERROR.
     * Shown as "X of 6 data sources unavailable" in UI.
     */
    private int unavailableProviderCount;

    /** When this assessment was calculated. */
    private Instant calculatedAt;
}