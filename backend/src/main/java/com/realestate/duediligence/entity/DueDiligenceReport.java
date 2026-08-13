package com.realestate.duediligence.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.realestate.duediligence.enums.ReportStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Due diligence report generated for a property.
 * A property can have multiple reports (versioned history).
 */
@Entity
@Table(
    name = "due_diligence_reports",
    indexes = {
        @Index(name = "idx_report_property", columnList = "property_id"),
        @Index(name = "idx_report_user", columnList = "generated_by"),
        @Index(name = "idx_report_status", columnList = "status"),
        @Index(name = "idx_report_share_token", columnList = "share_token"),
        @Index(name = "idx_report_created_at", columnList = "created_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DueDiligenceReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User generatedBy;

    /** Snapshot of the risk assessment at report generation time. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_assessment_id")
    private RiskAssessment riskAssessmentSnapshot;

    /** Human-readable title. e.g. "Due Diligence Report — 789 Demo Street" */
    @Column(nullable = false, length = 300)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    /** Version number — incremented on regenerate. */
    @Column(nullable = false)
    @Builder.Default
    private Integer version = 1;

    /**
     * Public share token for shareable read-only links.
     * e.g. /reports/shared/{shareToken}
     */
    @Column(name = "share_token", unique = true, length = 100)
    private String shareToken;

    /** When the share link expires (null = never). */
    @Column(name = "share_expires_at")
    private LocalDateTime shareExpiresAt;

    /** Snapshot of overall risk score at report time. */
    @Column(name = "risk_score_snapshot")
    private Double riskScoreSnapshot;

    /** Executive summary (AI-generated or template-based). */
    @Column(name = "executive_summary", length = 4000)
    private String executiveSummary;

    /** Sections that make up the report body (ordered). */
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<ReportSection> sections = new ArrayList<>();

    /** Error message if generation failed. */
    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    /** When generation actually completed. */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = ReportStatus.PENDING;
        if (this.version == null) this.version = 1;
        if (this.shareToken == null) this.shareToken = UUID.randomUUID().toString();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

        /** AI-generated executive summary (JSON: verdict + bullets + rationale). */
    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    /** When aiSummary was last generated. */
    @Column(name = "ai_summary_generated_at")
    private LocalDateTime aiSummaryGeneratedAt;
}
