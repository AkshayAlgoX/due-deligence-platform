package com.realestate.duediligence.service.impl;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.dto.DashboardStatsResponse.Trends;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PropertyRepository propertyRepository;

    @Override
    public DashboardStatsResponse getStats() {
        long totalProperties = propertyRepository.count();

        // Real: total from DB
        // Derived: reports/alerts (until backend tables exist)
        long reportsGenerated = Math.max(0, (long) (totalProperties * 0.65));
        int avgRiskScore = 42;
        int activeAlerts = (int) Math.min(totalProperties, 12);

        Trends trends = new Trends(12, 8, -4, 3);

        return new DashboardStatsResponse(
                totalProperties,
                reportsGenerated,
                avgRiskScore,
                activeAlerts,
                trends
        );
    }
}