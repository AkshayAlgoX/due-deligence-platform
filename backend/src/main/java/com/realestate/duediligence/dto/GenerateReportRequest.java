// backend/src/main/java/com/realestate/duediligence/dto/GenerateReportRequest.java
package com.realestate.duediligence.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for POST /api/reports/generate
 *
 * Only propertyId is required — everything else has smart defaults.
 * Optional title lets users label reports for their own reference
 * (e.g. "Pre-purchase review — Bengaluru Villa").
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GenerateReportRequest {

    @NotNull(message = "propertyId is required")
    private Long propertyId;

    /**
     * User-provided title. If null, service auto-generates:
     * "Due Diligence Report - {propertyAddress} - v{version}"
     */
    @Size(max = 255, message = "Title must be under 255 characters")
    private String title;

    /**
     * If true, forces a fresh risk recalculation before report generation.
     * Default: false (uses latest cached assessment).
     * Set true when property data has changed significantly.
     */
    @Builder.Default
    private Boolean forceRiskRecalculation = false;
}