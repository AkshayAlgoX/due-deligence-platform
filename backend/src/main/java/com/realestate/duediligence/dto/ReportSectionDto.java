// backend/src/main/java/com/realestate/duediligence/dto/ReportSectionDto.java
package com.realestate.duediligence.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One section inside a DueDiligenceReport.
 *
 * A report is composed of 8 sections in a fixed order:
 *   COVER → EXECUTIVE_SUMMARY → PROPERTY_OVERVIEW → RISK_ANALYSIS →
 *   COMPARABLE → FINANCIAL → RECOMMENDATIONS → APPENDIX
 *
 * `content` is rendered markdown/HTML for the section body.
 * `dataJson` is structured data the frontend can use for custom rendering
 * (e.g. render risk analysis with a radar chart from parsed JSON, not just prose).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReportSectionDto {

    private Long id;

    /** Section type identifier (COVER, EXECUTIVE_SUMMARY, etc.). */
    private String sectionType;

    /** Human-readable section title (localized on frontend). */
    private String title;

    /** Position in the report — smaller = earlier. Sections are pre-sorted. */
    private Integer orderIndex;

    /**
     * Rendered content — plain text or markdown.
     * Frontend can render as-is or transform to HTML.
     */
    private String content;

    /**
     * Structured JSON data for advanced rendering.
     * Example: risk analysis section stores full RiskBreakdownDto JSON here
     * so frontend can render an interactive radar chart.
     * Null for sections that don't need structured data.
     */
    private String dataJson;

    private Instant createdAt;
}