package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.CityActivityDto;
import com.realestate.duediligence.dto.DashboardStatsDto;
import com.realestate.duediligence.dto.RiskDistributionDto;
import com.realestate.duediligence.dto.MonthlyTrendDto;
import com.realestate.duediligence.dto.UserActivityDto;

public interface AdminAnalyticsService {

    DashboardStatsDto getStats(int periodDays);

    List<CityActivityDto> getTopCities(int limit);

    long getActiveUsers(int periodDays);

    List<RiskDistributionDto> getRiskDistribution(int periodDays);

    List<MonthlyTrendDto> getReportsTrend(int periodDays, String granularity);

    List<UserActivityDto> getUserActivityHeatmap();
}