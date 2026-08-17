package com.realestate.duediligence.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;

import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Persisted snapshot of one full aggregation run for a property.
 *
 * Why store this:
 * - PropertyAggregationService fetches live/mock data on every call
 * (only cached briefly in memory via @Cacheable). Nothing survives
 * a restart or feeds report history / audit trail.
 * - This entity captures the full result of one aggregation, so we
 * have durable history: what the report looked like, when, and
 * how healthy the aggregation was (overallStatus).
 *
 * Each *Json column stores the serialized IntegrationResponse<T> for
 * that section (ownership, tax, zoning, flood, permits, environmental),
 * so the exact shape returned to the frontend can be reconstructed later
 * without re-calling any provider.
 */
@Entity
@Table(name = "property_due_diligence_snapshots")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDueDiligenceSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Property property;

    @Column(name = "ownership_json", columnDefinition = "TEXT")
    private String ownershipJson;
    @Column(name = "tax_history_json", columnDefinition = "TEXT")
    private String taxHistoryJson;
    @Column(name = "zoning_json", columnDefinition = "TEXT")
    private String zoningJson;

    @Column(name = "flood_zone_json", columnDefinition = "TEXT")
    private String floodZoneJson;
    @Column(name = "permits_json", columnDefinition = "TEXT")
    private String permitsJson;

    @Column(name = "environmental_json", columnDefinition = "TEXT")
    private String environmentalJson;

    @Column(name = "overall_status")
    private String overallStatus;

    @Column(name = "total_duration_ms")
    private Long totalDurationMs;

    @Column(name = "aggregated_at")
    private Instant aggregatedAt;

    @Column(name = "created_at")
    private Instant createdAt;
}