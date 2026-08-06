// backend/src/main/java/com/realestate/duediligence/config/RiskScoringConfig.java
package com.realestate.duediligence.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

/**
 * Externalized risk scoring configuration.
 *
 * All weights and thresholds are in application.properties under
 * the prefix "risk.scoring" — change values without recompiling.
 *
 * Defaults below match the spec:
 *   FLOOD 25%, LEGAL 20%, TAX 15%, ZONING 15%, ENVIRONMENTAL 15%, MARKET 10%
 *   Score thresholds: LOW 0–25, MEDIUM 26–50, HIGH 51–75, CRITICAL 76–100
 *
 * Add to application.properties to override:
 *   risk.scoring.weights.flood=0.25
 *   risk.scoring.thresholds.medium=26.0
 *   risk.scoring.uncertainty-penalty=15.0
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "risk.scoring")
public class RiskScoringConfig {

    // ── Category weights (must sum to 1.0) ───────────────────────

    private Weights weights = new Weights();

    @Data
    public static class Weights {
        /** FLOOD weight — default 25% */
        private double flood = 0.25;

        /** LEGAL weight — default 20% */
        private double legal = 0.20;

        /** TAX weight — default 15% */
        private double tax = 0.15;

        /** ZONING weight — default 15% */
        private double zoning = 0.15;

        /** ENVIRONMENTAL weight — default 15% */
        private double environmental = 0.15;

        /** MARKET weight — default 10% */
        private double market = 0.10;
    }

    // ── Score thresholds ──────────────────────────────────────────

    private Thresholds thresholds = new Thresholds();

    @Data
    public static class Thresholds {
        /**
         * Score >= this → MEDIUM risk (below = LOW).
         * Default: 26.0 (so 0–25 = LOW)
         */
        private double medium = 26.0;

        /**
         * Score >= this → HIGH risk.
         * Default: 51.0 (so 26–50 = MEDIUM)
         */
        private double high = 51.0;

        /**
         * Score >= this → CRITICAL risk.
         * Default: 76.0 (so 51–75 = HIGH, 76–100 = CRITICAL)
         */
        private double critical = 76.0;
    }

    // ── Uncertainty penalty ───────────────────────────────────────

    /**
     * Score penalty added when a provider returns MOCK/UNAVAILABLE/TIMEOUT/ERROR.
     * Default: 15.0 — represents "we don't know, assume moderate risk".
     * Range: 0–50. Set to 0 to disable penalty.
     */
    private double uncertaintyPenalty = 15.0;

    // ── Flood scoring parameters ──────────────────────────────────

    private Flood flood = new Flood();

    @Data
    public static class Flood {
        /** Score for FLOOD_PRONE zone classification. Default: 90 */
        private double floodProneScore = 90.0;

        /** Score for HIGH_RISK zone. Default: 70 */
        private double highRiskScore = 70.0;

        /** Score for MODERATE_RISK zone. Default: 40 */
        private double moderateRiskScore = 40.0;

        /** Score for LOW_RISK zone. Default: 10 */
        private double lowRiskScore = 10.0;

        /** Bonus added when insuranceRequired=true. Default: 10 */
        private double insuranceRequiredBonus = 10.0;

        /**
         * Distance threshold: if water body closer than this (meters),
         * add proximity penalty. Default: 500 meters.
         */
        private double waterBodyProximityThresholdMeters = 500.0;

        /** Score added when water body is within proximity threshold. Default: 8 */
        private double waterBodyProximityBonus = 8.0;
    }

    // ── Tax scoring parameters ────────────────────────────────────

    private Tax tax = new Tax();

    @Data
    public static class Tax {
        /** Score per OVERDUE tax record. Default: 30 */
        private double overdueRecordScore = 30.0;

        /** Score per PENDING tax record. Default: 15 */
        private double pendingRecordScore = 15.0;

        /**
         * Max score from tax (capped to prevent 1 field dominating).
         * Default: 80 (still allows CRITICAL if truly bad)
         */
        private double maxScore = 80.0;
    }

    // ── Environmental scoring parameters ─────────────────────────

    private Environmental environmental = new Environmental();

    @Data
    public static class Environmental {
        /** AQI scores by category (CPCB classification). */
        private double aqiGoodScore = 5.0;
        private double aqiSatisfactoryScore = 15.0;
        private double aqiModerateScore = 35.0;
        private double aqiPoorScore = 55.0;
        private double aqiVeryPoorScore = 75.0;
        private double aqiSevereScore = 95.0;

        /** Penalty if nearIndustrialZone=true. Default: 15 */
        private double industrialZonePenalty = 15.0;

        /** Penalty for HIGH noise (>= 70dB). Default: 10 */
        private double highNoisePenalty = 10.0;

        /** Noise threshold dB for penalty. Default: 70 */
        private int highNoiseThresholdDb = 70;
    }

    // ── Market scoring parameters ─────────────────────────────────

    private Market market = new Market();

    @Data
    public static class Market {
        /**
         * Age threshold: properties older than this (years) get age penalty.
         * Default: 30 years
         */
        private int oldBuildingThresholdYears = 30;

        /**
         * Age threshold: properties older than this get severe penalty.
         * Default: 50 years
         */
        private int veryOldBuildingThresholdYears = 50;

        /** Score for OLD condition. Default: 25 */
        private double oldConditionScore = 25.0;

        /** Score for POOR condition. Default: 50 */
        private double poorConditionScore = 50.0;

        /** Score for VERY_POOR condition. Default: 75 */
        private double veryPoorConditionScore = 75.0;

        /** Discount for verified properties (they are more trustworthy). Default: 5 */
        private double verifiedDiscount = 5.0;
    }
}