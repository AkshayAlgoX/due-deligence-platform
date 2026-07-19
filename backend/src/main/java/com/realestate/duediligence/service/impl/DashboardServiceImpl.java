package com.realestate.duediligence.service.impl;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @Override
    public DashboardStatsResponse getStats() {
        // ── Real DB counts — no invented numbers ──────────────────────
        long totalProperties = propertyRepository.count();
        long verifiedProperties = propertyRepository.countByVerifiedTrue();
        long pendingProperties = propertyRepository.countByVerifiedFalse();
        long totalUsers = userRepository.count();

        return DashboardStatsResponse.builder()
                .totalProperties(totalProperties)
                .verifiedProperties(verifiedProperties)
                .pendingProperties(pendingProperties)
                .totalUsers(totalUsers)
                .reportsGenerated(0) // Reports module not built in Milestone 1
                .activeAlerts(0)     // Alerts module not built in Milestone 1
                .trends(DashboardStatsResponse.DashboardTrends.builder()
                        .propertiesGrowth(0) // Historical tracking not built yet
                        .reportsGrowth(0)
                        .riskChange(0)
                        .alertsChange(0)
                        .build())
                .build();
    }
}