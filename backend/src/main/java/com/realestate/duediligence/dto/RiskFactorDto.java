// backend/src/main/java/com/realestate/duediligence/dto/RiskFactorDto.java
package com.realestate.duediligence.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.realestate.duediligence.enums.RiskCategory;
import com.realestate.duediligence.enums.RiskLevel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Single risk factor detail — one per RiskCategory in the breakdown.
 *
 * Populated from RiskFactor entity or computed on the fly.
 * Contains both the score and the human explanation so the frontend
 * can render a full explainability card without extra calls.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RiskFactorDto {

    /** Which of the 6 risk categories this factor belongs to. */
    private RiskCategory category;

    /**
     * Raw score for this category: 0–100.
     * 0 = no risk detected, 100 = maximum risk detected.
     */
    private double score;

    /** Derived risk level for this category. */
    private RiskLevel level;

    /**
     * Weight this category carries in the overall score (0.0–1.0).
     * Matches RiskCategory.getWeight() — included here for frontend display.
     */
    private double weight;

    /**
     * Human-readable explanation of WHY this score was assigned.
     * Example: "Property is in HIGH_RISK flood zone (Zone AE).
     *           Flood insurance is mandatory. Last major flood: 2021-08-15."
     */
    private String explanation;

    /**
     * Actionable recommendation for this specific risk.
     * Example: "Obtain NDMA-approved flood insurance before purchase.
     *           Verify FEMA flood map at local municipal office."
     */
    private String recommendation;

    /**
     * Where the data came from: LIVE / MOCK / UNAVAILABLE / etc.
     * Shown in UI as a data quality indicator.
     */
    private String dataSource;

    /**
     * True if this factor's score includes an uncertainty penalty
     * because data was unavailable or from mock source.
     */
    private boolean dataUncertain;
}