package com.realestate.duediligence.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.ActivityItemResponse;
import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.dto.DashboardTrendsResponse;
import com.realestate.duediligence.dto.PortfolioInsightsResponse;
import com.realestate.duediligence.service.DashboardService;

import lombok.RequiredArgsConstructor;

/**
 * DashboardController — exposes portfolio stats, insights, activity, and trends.
 *
 * Accessible to any authenticated user.
 * No dummy data — every field returned is computed from real DB tables.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * GET /api/dashboard/stats
     * KPI counts for the dashboard cards.
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    /**
     * GET /api/dashboard/insights
     * Portfolio-level analytics: total value, distributions, top city.
     */
    @GetMapping("/insights")
    public ResponseEntity<PortfolioInsightsResponse> getInsights() {
        return ResponseEntity.ok(dashboardService.getPortfolioInsights());
    }

    /**
     * GET /api/dashboard/activity?limit=10
     * Recent activity feed (default 10 items, max 30).
     */
    @GetMapping("/activity")
    public ResponseEntity<List<ActivityItemResponse>> getActivity(
            @RequestParam(defaultValue = "10") int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 30);
        return ResponseEntity.ok(dashboardService.getRecentActivity(safeLimit));
    }

    /**
     * GET /api/dashboard/trends
     * Week-over-week deltas for KPI trend indicators.
     */
    @GetMapping("/trends")
    public ResponseEntity<DashboardTrendsResponse> getTrends() {
        return ResponseEntity.ok(dashboardService.getTrends());
    }
}