package com.realestate.duediligence.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.realestate.duediligence.enums.RiskCategory;
import com.realestate.duediligence.enums.RiskLevel;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A single risk factor contributing to a RiskAssessment.
 * Provides granular explainability — e.g., "Flood zone A: +40 pts because FEMA zone AE".
 */
@Entity
@Table(
    name = "risk_factors",
    indexes = {
        @Index(name = "idx_factor_assessment", columnList = "assessment_id"),
        @Index(name = "idx_factor_category", columnList = "category")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private RiskAssessment riskAssessment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RiskCategory category;

    /** Category score (0-100). */
    @Column(nullable = false)
    private Double score;

    /** Bucketed level for this specific factor. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RiskLevel level;

    /** Weight this factor contributes to the overall assessment (0.0 - 1.0). */
    @Column(nullable = false)
    private Double weight;

    /**
     * Human-readable explanation used for explainability UI.
     * e.g. "Property in FEMA flood zone AE — 1% annual chance of flooding"
     */
    @Column(length = 1000)
    private String explanation;

    /**
     * Concrete recommendation for the user.
     * e.g. "Purchase flood insurance (~$1,200/yr)"
     */
    @Column(length = 1000)
    private String recommendation;

    /**
     * Source of the data used to compute this factor.
     * e.g. "FEMA National Flood Hazard Layer"
     */
    @Column(name = "data_source", length = 200)
    private String dataSource;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }
}