package com.realestate.duediligence.entity;

import java.time.LocalDateTime;

import com.realestate.duediligence.enums.ValuationMethod;

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
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "property_valuations",
        indexes = {
                @Index(name = "idx_property_valuation_property", columnList = "property_id")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyValuation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "estimated_value", nullable = false)
    private Double estimatedValue;

    @Column(name = "confidence_low")
    private Double confidenceLow;

    @Column(name = "confidence_high")
    private Double confidenceHigh;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ValuationMethod method;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

    @PrePersist
    protected void onCreate() {
        this.calculatedAt = LocalDateTime.now();
    }
}
