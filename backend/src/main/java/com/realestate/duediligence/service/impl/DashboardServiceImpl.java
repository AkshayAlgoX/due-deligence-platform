package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.ActivityItemResponse;
import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.dto.DashboardTrendsResponse;
import com.realestate.duediligence.dto.PortfolioInsightsResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    // ────────────────────────────────────────────────────────────────
    // getStats — existing (unchanged behavior + activeUsers added)
    // ────────────────────────────────────────────────────────────────

    @Override
    public DashboardStatsResponse getStats() {
        long totalProperties    = propertyRepository.count();
        long verifiedProperties = propertyRepository.countByVerifiedTrue();
        long pendingProperties  = propertyRepository.countByVerifiedFalse();
        long totalUsers         = userRepository.count();

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long activeUsers = userRepository.countActiveUsersSince(thirtyDaysAgo);

        return DashboardStatsResponse.builder()
                .totalProperties(totalProperties)
                .verifiedProperties(verifiedProperties)
                .pendingProperties(pendingProperties)
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .reportsGenerated(0)
                .activeAlerts(0)
                .trends(DashboardStatsResponse.DashboardTrends.builder()
                        .propertiesGrowth(0)
                        .reportsGrowth(0)
                        .riskChange(0)
                        .alertsChange(0)
                        .build())
                .build();
    }

    // ────────────────────────────────────────────────────────────────
    // getPortfolioInsights — NEW
    // ────────────────────────────────────────────────────────────────

    @Override
    public PortfolioInsightsResponse getPortfolioInsights() {
        double totalValue = propertyRepository.sumMarketValue();
        double avgValue   = propertyRepository.averageMarketValue();
        long totalCities  = propertyRepository.countDistinctCities();

        // Highest value property
        List<Property> topByValue = propertyRepository.findTopByMarketValue();
        PortfolioInsightsResponse.HighlightProperty highlight = null;
        if (!topByValue.isEmpty()) {
            Property p = topByValue.get(0);
            highlight = PortfolioInsightsResponse.HighlightProperty.builder()
                    .id(p.getId())
                    .address(p.getAddress())
                    .city(p.getCity())
                    .marketValue(p.getMarketValue() != null ? p.getMarketValue() : 0)
                    .build();
        }

        // Distribution by type
        List<Object[]> typeRows = propertyRepository.aggregateByType();
        List<PortfolioInsightsResponse.TypeDistribution> byType = typeRows.stream()
                .map(row -> PortfolioInsightsResponse.TypeDistribution.builder()
                        .propertyType(row[0] != null ? (String) row[0] : "Unknown")
                        .count((Long) row[1])
                        .totalValue(row[2] != null ? ((Number) row[2]).doubleValue() : 0)
                        .build())
                .collect(Collectors.toList());

        // Distribution by city (top 10)
        List<Object[]> cityRows = propertyRepository.aggregateByCity();
        List<PortfolioInsightsResponse.CityDistribution> byCity = cityRows.stream()
                .limit(10)
                .map(row -> PortfolioInsightsResponse.CityDistribution.builder()
                        .city((String) row[0])
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        // User's top city = city with most properties
        String topCity = byCity.isEmpty() ? null : byCity.get(0).getCity();

        return PortfolioInsightsResponse.builder()
                .totalPortfolioValue(totalValue)
                .averagePropertyValue(avgValue)
                .highestValueProperty(highlight)
                .distributionByType(byType)
                .distributionByCity(byCity)
                .userTopCity(topCity)
                .totalCitiesCovered((int) totalCities)
                .build();
    }

    // ────────────────────────────────────────────────────────────────
    // getRecentActivity — NEW
    // ────────────────────────────────────────────────────────────────

    @Override
    public List<ActivityItemResponse> getRecentActivity(int limit) {
        List<Property> recent = propertyRepository.findTop30ByOrderByUpdatedAtDesc();

        List<ActivityItemResponse> items = new ArrayList<>();

        for (Property p : recent) {
            LocalDateTime created = p.getCreatedAt();
            LocalDateTime updated = p.getUpdatedAt();

            String type;
            LocalDateTime timestamp;

            // Classify: added vs verified vs updated
            if (created != null && updated != null && created.equals(updated)) {
                type = "PROPERTY_ADDED";
                timestamp = created;
            } else if (Boolean.TRUE.equals(p.getVerified())) {
                type = "PROPERTY_VERIFIED";
                timestamp = updated != null ? updated : created;
            } else {
                type = "PROPERTY_UPDATED";
                timestamp = updated != null ? updated : created;
            }

            String actorName = null;
            User actor = p.getCreatedBy();
            if (actor != null) {
                actorName = actor.getFullName() != null && !actor.getFullName().isBlank()
                        ? actor.getFullName()
                        : actor.getEmail();
            }

            items.add(ActivityItemResponse.builder()
                    .type(type)
                    .propertyId(p.getId())
                    .propertyAddress(p.getAddress())
                    .propertyCity(p.getCity())
                    .timestamp(timestamp)
                    .actorName(actorName)
                    .build());
        }

        // Sort by timestamp desc, cap at limit
        return items.stream()
                .filter(i -> i.getTimestamp() != null)
                .sorted(Comparator.comparing(ActivityItemResponse::getTimestamp).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    // ────────────────────────────────────────────────────────────────
    // getTrends — NEW
    // ────────────────────────────────────────────────────────────────

    @Override
    public DashboardTrendsResponse getTrends() {
        LocalDateTime now         = LocalDateTime.now();
        LocalDateTime weekAgo     = now.minusDays(7);
        LocalDateTime twoWeeksAgo = now.minusDays(14);

        long propsThisWeek     = propertyRepository.countByCreatedAtBetween(weekAgo, now);
        long propsLastWeek     = propertyRepository.countByCreatedAtBetween(twoWeeksAgo, weekAgo);

        long verifiedThisWeek  = propertyRepository.countByVerifiedTrueAndUpdatedAtBetween(weekAgo, now);
        long verifiedLastWeek  = propertyRepository.countByVerifiedTrueAndUpdatedAtBetween(twoWeeksAgo, weekAgo);

        long usersThisWeek     = userRepository.countByCreatedAtBetween(weekAgo, now);
        long usersLastWeek     = userRepository.countByCreatedAtBetween(twoWeeksAgo, weekAgo);

        return DashboardTrendsResponse.builder()
                .propertiesThisWeek(propsThisWeek)
                .propertiesLastWeek(propsLastWeek)
                .propertiesGrowthPct(pctChange(propsThisWeek, propsLastWeek))
                .verifiedThisWeek(verifiedThisWeek)
                .verifiedLastWeek(verifiedLastWeek)
                .verifiedGrowthPct(pctChange(verifiedThisWeek, verifiedLastWeek))
                .newUsersThisWeek(usersThisWeek)
                .newUsersLastWeek(usersLastWeek)
                .usersGrowthPct(pctChange(usersThisWeek, usersLastWeek))
                .build();
    }

    // ────────────────────────────────────────────────────────────────
    // Helper: growth percent (capped)
    // ────────────────────────────────────────────────────────────────

    /**
     * Percent change from previous to current.
     *   previous == 0 && current > 0  →  +100 (new activity)
     *   previous == 0 && current == 0 →   0
     *   otherwise                      →  ((cur - prev) / prev) * 100
     *
     * Result capped at ±999 to keep UI stable.
     */
    private int pctChange(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100 : 0;
        }
        double pct = ((double) (current - previous) / previous) * 100.0;
        int rounded = (int) Math.round(pct);
        if (rounded > 999) return 999;
        if (rounded < -999) return -999;
        return rounded;
    }
}