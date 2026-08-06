// backend/src/main/java/com/realestate/duediligence/dto/ReportSummaryDto.java
package com.realestate.duediligence.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.realestate.duediligence.enums.ReportStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight report summary — used in list endpoints and status polling.
 *
 * Excludes sections and heavy content — fetch full report via /reports/{id}
 * when user selects one. This is what the "My Reports" page renders.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReportSummaryDto {

    private Long id;
    private Long propertyId;
    private String propertyAddress;   // denormalized for list rendering (no extra fetch)
    private String title;
    private ReportStatus status;
    private Integer version;

    /** Snapshot of risk score at generation time (not live). */
    private Double riskScoreSnapshot;

    /** Set when status=FAILED — surfaced in UI as inline error. */
    private String errorMessage;

    private Instant createdAt;
    private Instant completedAt;
    private String generatedByEmail;  // denormalized for admin views
}