package com.realestate.duediligence.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.realestate.duediligence.enums.RiskLevel;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Aggregated risk assessment for a property.
 * One property = one active assessment (latest one wins).
 * History is preserved — old assessments are kept for trend analysis.
 */
@Entity
@Table(
    name = "risk_assessments",
    indexes = {
        @Index(name = "idx_risk_property", columnList = "property_id"),
        @Index(name = "idx_risk_level", columnList = "overall_level"),
        @Index(name = "idx_risk_calculated_at", columnList = "calculated_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Property property;

    /** Weighted overall risk score (0-100). */
    @Column(name = "overall_score", nullable = false)
    private Double overallScore;

    /** Bucketed classification of the overall score. */
    @Enumerated(EnumType.STRING)
    @Column(name = "overall_level", nullable = false, length = 20)
    private RiskLevel overallLevel;

    /** Snapshot of per-category scores (JSON summary for quick reads). */
    @Column(name = "flood_score")
    private Double floodScore;

    @Column(name = "legal_score")
    private Double legalScore;

    @Column(name = "tax_score")
    private Double taxScore;

    @Column(name = "zoning_score")
    private Double zoningScore;

    @Column(name = "environmental_score")
    private Double environmentalScore;

    @Column(name = "market_score")
    private Double marketScore;

    /**
     * Human-readable AI-style summary of the assessment.
     * e.g. "High risk due to flood zone A + pending litigation"
     */
    @Column(name = "summary", length = 2000)
    private String summary;

    /** Whether the property is currently the "latest" (active) assessment. */
    @Column(name = "is_latest", nullable = false)
    @Builder.Default
    private Boolean isLatest = true;

    /** Detailed breakdown factors (one per category or sub-factor). */
    @OneToMany(mappedBy = "riskAssessment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<RiskFactor> factors = new ArrayList<>();

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.calculatedAt == null) this.calculatedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isLatest == null) this.isLatest = true;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}