// backend/src/main/java/com/realestate/duediligence/dto/RiskHistoryDto.java
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
 * Risk score history for a property — used by GET /api/properties/{propertyId}/risk/history
 *
 * Powers the trend chart: shows how risk has changed over time
 * as property data updates (new tax records, flood zone reclassification, etc.)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RiskHistoryDto {

    private Long propertyId;

    /**
     * Chronological list of all assessments (oldest first).
     * Frontend reverses for display (newest first in table, oldest first in chart).
     */
    private List<HistoryEntry> history;

    /** Total number of assessments ever computed for this property. */
    private int totalAssessments;

    /** The current latest assessment ID. */
    private Long latestAssessmentId;

    // ── Trend metadata ────────────────────────────────────────────

    /** Score change from first to latest assessment (can be negative = improving). */
    private Double scoreDelta;

    /** Level of the latest assessment. */
    private RiskLevel currentLevel;

    /** Level of the first (oldest) assessment for comparison. */
    private RiskLevel baselineLevel;

    // ── Inner record ──────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HistoryEntry {

        private Long assessmentId;
        private double overallScore;
        private RiskLevel overallLevel;

        /** Per-category scores for sparkline charts. */
        private double floodScore;
        private double legalScore;
        private double taxScore;
        private double zoningScore;
        private double environmentalScore;
        private double marketScore;

        private String summary;
        private boolean dataIncomplete;
        private Instant calculatedAt;

        /** True if this is the current (latest) assessment. */
        private boolean isLatest;
    }
}