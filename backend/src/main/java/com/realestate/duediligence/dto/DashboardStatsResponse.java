package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private Long totalProperties;
    private Long reportsGenerated;
    private Integer avgRiskScore;
    private Integer activeAlerts;
    private Trends trends;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Trends {
        private Integer propertiesGrowth;
        private Integer reportsGrowth;
        private Integer riskChange;
        private Integer alertsChange;
    }
}