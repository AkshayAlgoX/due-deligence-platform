package com.realestate.duediligence.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.ActivityItemResponse;
import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.dto.DashboardTrendsResponse;
import com.realestate.duediligence.dto.PortfolioHistoryPoint;
import com.realestate.duediligence.dto.PortfolioInsightsResponse;
import com.realestate.duediligence.dto.RecommendationResponse;
import com.realestate.duediligence.service.DashboardService;
import com.realestate.duediligence.service.PortfolioSnapshotService;

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
    private final PortfolioSnapshotService portfolioSnapshotService;
    private final com.realestate.duediligence.repository.UserRepository userRepository;

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
    /**
 * GET /api/dashboard/history?days=30
 *
 * Returns daily portfolio snapshots for the authenticated user.
 * Admins see the platform-wide aggregate.
 * days param: 7 | 30 | 90 (clamped to 1–365).
 */
@GetMapping("/history")
public ResponseEntity<List<PortfolioHistoryPoint>> getHistory(
        @RequestParam(defaultValue = "30") int days,
        Authentication authentication) {

    int safeDays = Math.min(Math.max(days, 1), 365);

    // Check if caller is ADMIN — admins see platform aggregate
    boolean isAdmin = authentication != null &&
            authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

    if (isAdmin) {
        return ResponseEntity.ok(
                portfolioSnapshotService.getPlatformHistory(safeDays));
    }

    // Regular user — look up their DB id from email (JWT subject)
    String email = authentication != null ? authentication.getName() : null;
    if (email == null) {
        return ResponseEntity.ok(List.of());
    }

    // Reuse UserRepository via DashboardService — but we need userRepo here.
    // Cleanest: inject UserRepository directly (controller is already thin).
    com.realestate.duediligence.entity.User user =
            userRepository.findByEmail(email).orElse(null);

    if (user == null) {
        return ResponseEntity.ok(List.of());
    }

    return ResponseEntity.ok(
            portfolioSnapshotService.getHistoryForUser(user.getId(), safeDays));
}
/**
 * GET /api/dashboard/recommendations
 * Rule-based actionable recommendations from real portfolio data.
 */
@GetMapping("/recommendations")
public ResponseEntity<List<RecommendationResponse>> getRecommendations() {
    return ResponseEntity.ok(dashboardService.getRecommendations());
}
}