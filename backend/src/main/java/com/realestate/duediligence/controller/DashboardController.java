package com.realestate.duediligence.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.service.DashboardService;

import lombok.RequiredArgsConstructor;

/**
 * DashboardController — exposes aggregated portfolio stats.
 *
 * Accessible to any authenticated user (roles checked at service layer).
 * No dummy data — every field returned is computed from real DB tables.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * GET /api/dashboard/stats
     *
     * Returns live counts for the dashboard KPI cards.
     * Fields that have no backing table yet return 0 (never fake values).
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
}