package com.realestate.duediligence.service.impl;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.dto.DashboardStatsResponse.Trends;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.DashboardService;

import lombok.RequiredArgsConstructor;

/**
 * DashboardServiceImpl — computes real stats from the database.
 *
 * Design decisions:
 *  - reportsGenerated: no Report table exists yet → return 0 honestly
 *  - avgRiskScore: no RiskScore table exists yet → return 0 honestly
 *  - activeAlerts: no Alert table exists yet → return 0 honestly
 *  - trends: no historical snapshots exist → return 0 (no fake percentages)
 *
 * When you add Report/RiskAssessment/Alert tables later, replace the
 * zero-returning stubs with real repository calls.
 */
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @Override
    public DashboardStatsResponse getStats() {

        // ── Real data from DB ────────────────────────────────────────────────
        long totalProperties = propertyRepository.count();
        long totalUsers      = userRepository.count();

        // ── Honest zeros until the backing tables exist ──────────────────────
        // TODO: replace when Report entity is added
        long reportsGenerated = 0L;

        // TODO: replace when RiskAssessment entity is added
        int avgRiskScore = 0;

        // TODO: replace when Alert entity is added
        int activeAlerts = 0;

        // ── Trends — zero until we have historical snapshots ─────────────────
        // TODO: compare against last-month snapshot when audit log table exists
        Trends trends = new Trends(0, 0, 0, 0);

        return new DashboardStatsResponse(
                totalProperties,
                reportsGenerated,
                avgRiskScore,
                activeAlerts,
                totalUsers,
                trends
        );
    }
}
