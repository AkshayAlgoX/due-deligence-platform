package com.realestate.duediligence.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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


/**
 * PortfolioSnapshot — one row per user per day.
 *
 * Captures the portfolio state at a point in time so we can
 * plot value trends on the dashboard. Written by a nightly cron
 * and also on every property add / update / delete so the
 * "today" data point is always fresh.
 *
 * userId is nullable — when null it represents the platform-wide
 * aggregate (used for admin view). For user-scoped charts we
 * always filter by userId.
 */
@Entity
@Table(
    name = "portfolio_snapshots",
    indexes = {
        @Index(name = "idx_snapshot_user_id",   columnList = "user_id"),
        @Index(name = "idx_snapshot_date",      columnList = "snapshot_date"),
        @Index(name = "idx_snapshot_user_date", columnList = "user_id, snapshot_date")
    }
)

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The calendar date this snapshot represents.
     * One snapshot per user per date — enforced in service layer
     * (upsert pattern: delete today's then insert fresh).
     */
    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    /** Sum of marketValue for all properties owned by this user on this date. */
    @Column(name = "total_value", nullable = false)
    private Double totalValue;

    /** Count of properties on this date. */
    @Column(name = "property_count", nullable = false)
    private Integer propertyCount;

    /** Count of verified properties on this date. */
    @Column(name = "verified_count", nullable = false)
    private Integer verifiedCount;

    /** Distinct cities covered on this date. */
    @Column(name = "total_cities", nullable = false)
    private Integer totalCities;

    /**
     * Owner of this snapshot.
     * Nullable — null means platform-wide aggregate for admin charts.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}