// backend/src/main/java/com/realestate/duediligence/dto/ReportSummaryDto.java
package com.realestate.duediligence.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.realestate.duediligence.enums.ReportStatus;
import com.realestate.duediligence.enums.RiskLevel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight report summary — used in list endpoints.
 *
 * Contains the risk snapshot captured when the report was generated.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReportSummaryDto {

    private Long id;

    private Long propertyId;

    private String propertyAddress;

    private String title;

    private ReportStatus status;

    private Integer version;

    /**
     * Risk score snapshot at report generation time.
     */
    private Double riskScoreSnapshot;

    /**
     * Risk level snapshot at report generation time.
     */
    private RiskLevel riskLevel;

    /**
     * Set when status = FAILED.
     */
    private String errorMessage;

    private Instant createdAt;

    private Instant completedAt;

    /**
     * User who generated the report.
     */
    private String generatedByEmail;
}