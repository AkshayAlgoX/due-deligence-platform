package com.realestate.duediligence.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalProperties;
    private long verifiedProperties;   // NEW — real count
    private long pendingProperties;    // NEW — real count
    private long totalUsers;
    private long reportsGenerated;
    private long activeAlerts;
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