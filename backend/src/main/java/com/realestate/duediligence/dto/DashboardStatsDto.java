package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalUsers;
    private long totalProperties;
    private long reportsThisMonth;
    private double avgRiskScore;
    private double userTrendPercent;
    private double propertyTrendPercent;
}