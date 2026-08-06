package com.realestate.duediligence.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A single section within a DueDiligenceReport.
 * Sections are ordered by orderIndex — e.g.:
 *   1. Cover Page
 *   2. Executive Summary
 *   3. Property Overview
 *   4. Risk Analysis
 *   5. Comparable Properties
 *   6. Financial Analysis
 *   7. Recommendations
 *   8. Appendix
 */
@Entity
@Table(
    name = "report_sections",
    indexes = {
        @Index(name = "idx_section_report", columnList = "report_id"),
        @Index(name = "idx_section_type", columnList = "section_type")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private DueDiligenceReport report;

    /**
     * Section type identifier. Recommended values:
     *   COVER, EXECUTIVE_SUMMARY, PROPERTY_OVERVIEW,
     *   RISK_ANALYSIS, COMPARABLE, FINANCIAL,
     *   RECOMMENDATIONS, APPENDIX
     */
    @Column(name = "section_type", nullable = false, length = 50)
    private String sectionType;

    @Column(nullable = false, length = 300)
    private String title;

    /** Order in which section appears in the report (1-based). */
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    /**
     * Rich content body — can be HTML/Markdown/JSON depending on renderer.
     * @Lob because sections can be large (charts, tables, embedded data).
     */
    @Lob
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    /**
     * Optional structured data (JSON) for frontend to render charts/tables.
     * Stored as text; parsed by frontend.
     */
    @Lob
    @Column(name = "data_json", columnDefinition = "TEXT")
    private String dataJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }
}