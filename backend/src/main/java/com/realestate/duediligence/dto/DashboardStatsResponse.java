package com.realestate.duediligence.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalProperties;
    private long verifiedProperties;
    private long pendingProperties;
    private long totalUsers;
    private long reportsGenerated;
    private long activeAlerts;

    /** NEW — users who created a property in the last 30 days */
    private long activeUsers;

    private DashboardTrends trends;

    @Data
    @Builder
    public static class DashboardTrends {
        private int propertiesGrowth;
        private int riskChange;
        private int reportsGrowth;
        private int alertsChange;
    }
}