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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "User Dashboard",
        description = "Per-user portfolio stats, insights, activity feed, trends, and recommendations. " +
                "All endpoints require authentication. Admin users see platform-wide aggregates for /history.")
public class DashboardController {

    private final DashboardService dashboardService;
    private final PortfolioSnapshotService portfolioSnapshotService;
    private final com.realestate.duediligence.repository.UserRepository userRepository;

    @GetMapping("/stats")
    @Operation(
            summary = "Get portfolio KPI stats",
            description = "Returns the authenticated user's KPI counts: total properties, active reports, " +
                    "average risk score, and verification status breakdown.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Stats returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/insights")
    @Operation(
            summary = "Get portfolio-level insights",
            description = "Returns aggregated analytics: total portfolio value, property type distribution, " +
                    "risk level distribution, top city, and price-per-sqft statistics.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Insights returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public ResponseEntity<PortfolioInsightsResponse> getInsights() {
        return ResponseEntity.ok(dashboardService.getPortfolioInsights());
    }

    @GetMapping("/activity")
    @Operation(
            summary = "Get recent activity feed",
            description = "Returns the N most recent activity items (property additions, reports generated, " +
                    "risk assessments) for the authenticated user. Capped at 30 items.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Activity feed returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public ResponseEntity<List<ActivityItemResponse>> getActivity(
            @Parameter(description = "Number of items to return (1–30, default 10)", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 30);
        return ResponseEntity.ok(dashboardService.getRecentActivity(safeLimit));
    }

    @GetMapping("/trends")
    @Operation(
            summary = "Get week-over-week KPI trends",
            description = "Returns trend deltas (percentage change) for key KPIs comparing this week vs last week. " +
                    "Used to render the up/down trend arrows on KPI cards.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Trend deltas returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public ResponseEntity<DashboardTrendsResponse> getTrends() {
        return ResponseEntity.ok(dashboardService.getTrends());
    }

    @GetMapping("/history")
    @Operation(
            summary = "Get portfolio value history",
            description = "Returns daily portfolio snapshots for the authenticated user. " +
                    "Admin users see the platform-wide aggregate instead of their personal data. " +
                    "Days parameter is clamped to 1–365.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "History snapshots returned (may be empty for new users)"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public ResponseEntity<List<PortfolioHistoryPoint>> getHistory(
            @Parameter(description = "Look-back window in days (1–365, default 30)", example = "30")
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {

        int safeDays = Math.min(Math.max(days, 1), 365);
        boolean isAdmin = authentication != null &&
                authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return ResponseEntity.ok(portfolioSnapshotService.getPlatformHistory(safeDays));
        }

        String email = authentication != null ? authentication.getName() : null;
        if (email == null) return ResponseEntity.ok(List.of());

        com.realestate.duediligence.entity.User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.ok(List.of());

        return ResponseEntity.ok(portfolioSnapshotService.getHistoryForUser(user.getId(), safeDays));
    }

    @GetMapping("/recommendations")
    @Operation(
            summary = "Get actionable recommendations",
            description = "Returns a list of rule-based recommendations derived from the user's current portfolio. " +
                    "Examples: unverified properties, properties with no risk assessment, high-risk alerts.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recommendations returned (may be empty)"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public ResponseEntity<List<RecommendationResponse>> getRecommendations() {
        return ResponseEntity.ok(dashboardService.getRecommendations());
    }
}
