package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DashboardStatsResponse — all fields come from real DB counts.
 *
 * Fields that have no backing table yet are documented with their
 * planned source so future contributors know exactly what to wire up.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    /** Real: PropertyRepository.count() */
    private Long totalProperties;

    /** Stub (0): will be ReportRepository.count() once Report entity exists */
    private Long reportsGenerated;

    /** Stub (0): will be AVG(RiskAssessment.score) once entity exists */
    private Integer avgRiskScore;

    /** Stub (0): will be AlertRepository.countByResolvedFalse() once entity exists */
    private Integer activeAlerts;

    /** Real: UserRepository.count() — added so dashboard can show team size */
    private Long totalUsers;

    /** All zeros until historical snapshot table exists — never fake percentages */
    private Trends trends;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Trends {
        /** % change in properties vs last month — 0 until snapshots exist */
        private Integer propertiesGrowth;

        /** % change in reports vs last month — 0 until snapshots exist */
        private Integer reportsGrowth;

        /** % change in avg risk vs last month — 0 until snapshots exist */
        private Integer riskChange;

        /** count change in active alerts vs last month — 0 until snapshots exist */
        private Integer alertsChange;
    }
}