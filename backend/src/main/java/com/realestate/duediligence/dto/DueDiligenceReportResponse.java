// backend/src/main/java/com/realestate/duediligence/dto/DueDiligenceReportResponse.java
package com.realestate.duediligence.dto;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.realestate.duediligence.enums.ReportStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Complete report response — includes all sections in display order.
 *
 * Used by:
 *   GET /api/reports/{reportId}       → returns full report
 *   POST /api/reports/generate        → returns initial (PENDING) report shell
 *   POST /api/reports/{id}/regenerate → returns new report version shell
 *
 * Sections are pre-sorted by orderIndex ascending.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DueDiligenceReportResponse {

    private Long id;
    private Long propertyId;
    private String propertyAddress;

    private String title;
    private ReportStatus status;
    private Integer version;

    /** Snapshot of risk score at generation time. */
    private Double riskScoreSnapshot;

    /** Copy of the executive summary — also duplicated as first content section. */
    private String executiveSummary;

    /**
     * Error message if status=FAILED.
     * Frontend can display this and offer a "Try again" button (calls /regenerate).
     */
    private String errorMessage;

    /** All 8 sections in display order (COVER first, APPENDIX last). */
    private List<ReportSectionDto> sections;

    private Instant createdAt;
    private Instant completedAt;
    private Instant updatedAt;

    private String generatedByEmail;
    private Long generatedByUserId;
}