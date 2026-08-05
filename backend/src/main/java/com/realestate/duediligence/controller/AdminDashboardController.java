package com.realestate.duediligence.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.CityActivityDto;
import com.realestate.duediligence.dto.DashboardStatsDto;
import com.realestate.duediligence.dto.MonthlyTrendDto;
import com.realestate.duediligence.dto.RiskDistributionDto;
import com.realestate.duediligence.dto.UserActivityDto;
import com.realestate.duediligence.service.AdminAnalyticsService;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminAnalyticsService adminAnalyticsService;

    @Autowired
    public AdminDashboardController(AdminAnalyticsService adminAnalyticsService) {
        this.adminAnalyticsService = adminAnalyticsService;
    }

    @GetMapping("/stats")
    public DashboardStatsDto getStats(@RequestParam(defaultValue = "30d") String period) {
        int days = parsePeriodToDays(period);
        return adminAnalyticsService.getStats(days);
    }

    @GetMapping("/risk-distribution")
    public List<RiskDistributionDto> getRiskDistribution(@RequestParam(defaultValue = "30d") String period) {
        int days = parsePeriodToDays(period);
        return adminAnalyticsService.getRiskDistribution(days);
    }

    @GetMapping("/reports-trend")
    public List<MonthlyTrendDto> getReportsTrend(@RequestParam(defaultValue = "30d") String period,
            @RequestParam(defaultValue = "daily") String granularity) {
        int days = parsePeriodToDays(period);
        return adminAnalyticsService.getReportsTrend(days, granularity);
    }

    @GetMapping("/top-cities")
    public List<CityActivityDto> getTopCities(@RequestParam(defaultValue = "10") int limit) {
        return adminAnalyticsService.getTopCities(limit);
    }

    @GetMapping("/user-activity-heatmap")
    public List<UserActivityDto> getUserActivityHeatmap() {
        return adminAnalyticsService.getUserActivityHeatmap();
    }

    @GetMapping("/active-users")
    public long getActiveUsers(@RequestParam(defaultValue = "30") int periodDays) {
        return adminAnalyticsService.getActiveUsers(periodDays);
    }

    private int parsePeriodToDays(String period) {
        try {
            if (period != null && period.endsWith("d")) {
                return Integer.parseInt(period.substring(0, period.length() - 1));
            }
        } catch (NumberFormatException ignored) {
            // fall through to default
        }
        return 30;
    }
}