package com.realestate.duediligence.entity;

import com.realestate.duediligence.enums.SimilarityLevel;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A single comparable-property result row belonging to a ComparableAnalysis.
 * `compProperty` points at the actual Property being used as the comparable.
 */
@Entity
@Table(
        name = "comparable_properties",
        indexes = {
                @Index(name = "idx_comparable_property_analysis", columnList = "analysis_id"),
                @Index(name = "idx_comparable_property_comp", columnList = "comp_property_id")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComparableProperty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private ComparableAnalysis analysis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comp_property_id", nullable = false)
    private Property compProperty;

    @Column(name = "similarity_score")
    private Double similarityScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "similarity_level")
    private SimilarityLevel similarityLevel;

    @Column(name = "distance_km")
    private Double distanceKm;
}
