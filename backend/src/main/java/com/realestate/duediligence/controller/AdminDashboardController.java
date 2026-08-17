package com.realestate.duediligence.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import com.realestate.duediligence.service.AdminExportService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/admin/dashboard")
@Tag(name = "Admin Dashboard Analytics",
        description = "Platform-wide analytics for the admin dashboard. All endpoints require ROLE_ADMIN " +
                "(enforced by SecurityConfig /api/admin/**).")
public class AdminDashboardController {

    private final AdminAnalyticsService adminAnalyticsService;
    private final AdminExportService adminExportService;

    @Autowired
    public AdminDashboardController(
            AdminAnalyticsService adminAnalyticsService,
            AdminExportService adminExportService) {
        this.adminAnalyticsService = adminAnalyticsService;
        this.adminExportService = adminExportService;
    }

    @GetMapping("/stats")
    @Operation(
            summary = "Get platform KPI stats",
            description = "Returns total users, total properties, reports this period, average risk score, " +
                    "and period-over-period trend percentages.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Stats returned successfully"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public DashboardStatsDto getStats(
            @Parameter(description = "Time window — e.g. 7d, 30d, 90d", example = "30d")
            @RequestParam(defaultValue = "30d") String period) {
        int days = parsePeriodToDays(period);
        return adminAnalyticsService.getStats(days);
    }

    @GetMapping("/export")
    @Operation(
            summary = "Export dashboard analytics",
            description = "Downloads the admin dashboard analytics as a file. " +
                    "Supports format=excel (.xlsx), format=csv, or format=pdf. " +
                    "Supports language=en or language=hi for localised PDF/Excel labels.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "File returned as binary attachment"),
            @ApiResponse(responseCode = "400", description = "Unsupported format value"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN"),
            @ApiResponse(responseCode = "500", description = "Export generation failed")
    })
    public ResponseEntity<?> exportDashboard(
            @Parameter(description = "Export format: excel, csv, or pdf", example = "excel")
            @RequestParam(defaultValue = "excel") String format,
            @Parameter(description = "Time window, e.g. 30d", example = "30d")
            @RequestParam(defaultValue = "30d") String period,
            @Parameter(description = "Language code for localised labels (en, hi, bn, …)", example = "en")
            @RequestParam(defaultValue = "en") String language) {

        int days = parsePeriodToDays(period);

        try {
            byte[] fileBytes = adminExportService.exportDashboard(format, days, language);

            String filename;
            MediaType mediaType;

            if ("pdf".equalsIgnoreCase(format)) {
                filename = "admin-analytics.pdf";
                mediaType = MediaType.APPLICATION_PDF;
            } else if ("csv".equalsIgnoreCase(format)) {
                filename = "admin-analytics.csv";
                mediaType = MediaType.parseMediaType("text/csv");
            } else {
                filename = "admin-analytics.xlsx";
                mediaType = MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .body(fileBytes);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(AdminDashboardController.class)
                    .error("Dashboard export failed (format={}, period={}): {}", format, days, e.getMessage(), e);
            return ResponseEntity.status(500).body(
                    java.util.Map.of("success", false, "message",
                            "Failed to generate dashboard export. " + e.getMessage()));
        }
    }

    @GetMapping("/risk-distribution")
    @Operation(
            summary = "Get risk level distribution",
            description = "Returns counts of LOW / MEDIUM / HIGH / CRITICAL risk assessments " +
                    "across all currently-active (latest) property assessments.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Distribution returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public List<RiskDistributionDto> getRiskDistribution(
            @Parameter(description = "Time window, e.g. 30d", example = "30d")
            @RequestParam(defaultValue = "30d") String period) {
        return adminAnalyticsService.getRiskDistribution(parsePeriodToDays(period));
    }

    @GetMapping("/reports-trend")
    @Operation(
            summary = "Get reports generation trend",
            description = "Returns a time-series of report counts grouped by day or week, " +
                    "useful for the admin trend line chart.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Trend data returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public List<MonthlyTrendDto> getReportsTrend(
            @Parameter(description = "Time window, e.g. 30d", example = "30d")
            @RequestParam(defaultValue = "30d") String period,
            @Parameter(description = "Aggregation granularity: daily or weekly", example = "daily")
            @RequestParam(defaultValue = "daily") String granularity) {
        return adminAnalyticsService.getReportsTrend(parsePeriodToDays(period), granularity);
    }

    @GetMapping("/top-cities")
    @Operation(
            summary = "Get top cities by property count",
            description = "Returns the cities with the highest number of properties on the platform, " +
                    "sorted descending. Used for the TopCitiesBar chart.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "City list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public List<CityActivityDto> getTopCities(
            @Parameter(description = "Maximum number of cities to return", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        return adminAnalyticsService.getTopCities(limit);
    }

    @GetMapping("/user-activity-heatmap")
    @Operation(
            summary = "Get user activity heatmap data",
            description = "Returns a day-of-week × hour-of-day grid of login/activity counts. " +
                    "Used to render the heatmap widget on the admin dashboard.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Heatmap data returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public List<UserActivityDto> getUserActivityHeatmap() {
        return adminAnalyticsService.getUserActivityHeatmap();
    }

    @GetMapping("/active-users")
    @Operation(
            summary = "Get active user count",
            description = "Returns the number of distinct users who have created or updated a property " +
                    "within the given period. Used for the Active Users counter widget.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Active user count returned as a plain long"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public long getActiveUsers(
            @Parameter(description = "Look-back window in days", example = "30")
            @RequestParam(defaultValue = "30") int periodDays) {
        return adminAnalyticsService.getActiveUsers(periodDays);
    }

    private int parsePeriodToDays(String period) {
        try {
            if (period != null && period.endsWith("d")) {
                return Integer.parseInt(period.substring(0, period.length() - 1));
            }
        } catch (NumberFormatException ignored) {
        }
        return 30;
    }
}
