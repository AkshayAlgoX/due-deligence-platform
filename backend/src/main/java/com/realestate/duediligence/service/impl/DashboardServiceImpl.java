package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.ActivityItemResponse;
import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.dto.DashboardTrendsResponse;
import com.realestate.duediligence.dto.PortfolioInsightsResponse;
import com.realestate.duediligence.dto.RecommendationResponse;
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
    // ────────────────────────────────────────────────────────────────
// getRecommendations — 6 rules, all real data
// ────────────────────────────────────────────────────────────────

@Override
public List<RecommendationResponse> getRecommendations() {
    List<RecommendationResponse> results = new ArrayList<>();
    List<Property> all = propertyRepository.findAll();

    if (all.isEmpty()) return results;

    long totalCount      = all.size();
    long verifiedCount   = all.stream().filter(p -> Boolean.TRUE.equals(p.getVerified())).count();
    long pendingCount    = totalCount - verifiedCount;

    // ── Rule 1: Properties missing critical fields ────────────────
    // Find the property with the most missing fields
    Property mostIncomplete = null;
    int maxMissing = 0;
    for (Property p : all) {
        int missing = countMissingFields(p);
        if (missing > maxMissing) {
            maxMissing = missing;
            mostIncomplete = p;
        }
    }
    if (mostIncomplete != null && maxMissing > 0) {
        results.add(RecommendationResponse.builder()
                .type("MISSING_FIELDS")
                .severity("MEDIUM")
                .title("Incomplete property data")
                .description(maxMissing + " field" + (maxMissing > 1 ? "s" : "") +
                        " missing on " + mostIncomplete.getAddress() +
                        " — complete them to unlock verification.")
                .propertyId(mostIncomplete.getId())
                .actionUrl("/dashboard/property-search")
                .actionLabel("View property")
                .build());
    }

    // ── Rule 2: Properties with no photo ─────────────────────────
    long noPhoto = all.stream()
            .filter(p -> p.getImageUrl() == null || p.getImageUrl().isBlank())
            .count();
    if (noPhoto > 0) {
        // Point to the first property without a photo
        Property noPhotoProperty = all.stream()
                .filter(p -> p.getImageUrl() == null || p.getImageUrl().isBlank())
                .findFirst().orElse(null);
        results.add(RecommendationResponse.builder()
                .type("NO_PHOTO")
                .severity("LOW")
                .title(noPhoto + " propert" + (noPhoto > 1 ? "ies have" : "y has") + " no photo")
                .description("Adding a photo helps identify properties quickly and improves listing quality.")
                .propertyId(noPhotoProperty != null ? noPhotoProperty.getId() : null)
                .actionUrl("/dashboard/property-search")
                .actionLabel("Add photo")
                .build());
    }

    // ── Rule 3: Market value set but area missing (can't calc ₹/sqft) ──
    long noArea = all.stream()
            .filter(p -> p.getArea() == null && p.getMarketValue() != null)
            .count();
    if (noArea > 0) {
        Property noAreaProperty = all.stream()
                .filter(p -> p.getArea() == null && p.getMarketValue() != null)
                .findFirst().orElse(null);
        results.add(RecommendationResponse.builder()
                .type("NO_AREA")
                .severity("LOW")
                .title("Area missing on " + noArea + " propert" + (noArea > 1 ? "ies" : "y"))
                .description("Add area to calculate price per sqft — useful for comparing properties.")
                .propertyId(noAreaProperty != null ? noAreaProperty.getId() : null)
                .actionUrl("/dashboard/property-search")
                .actionLabel("Add area")
                .build());
    }

    // ── Rule 4: Portfolio concentration > 70% in one city ────────
    Map<String, Long> cityCount = all.stream()
            .filter(p -> p.getCity() != null)
            .collect(java.util.stream.Collectors.groupingBy(
                    Property::getCity,
                    java.util.stream.Collectors.counting()));

    cityCount.forEach((city, count) -> {
        double pct = (double) count / totalCount * 100;
        if (pct >= 70 && totalCount >= 3) {
            results.add(RecommendationResponse.builder()
                    .type("CONCENTRATION_" + city.toUpperCase().replace(" ", "_"))
                    .severity("MEDIUM")
                    .title("High concentration in " + city)
                    .description(Math.round(pct) + "% of your portfolio is in " +
                            city + ". Consider diversifying to reduce location risk.")
                    .propertyId(null)
                    .actionUrl("/dashboard/property-search")
                    .actionLabel("View portfolio")
                    .build());
        }
    });

    // ── Rule 5: All properties verified — positive signal ─────────
    if (pendingCount == 0 && totalCount > 0) {
        results.add(RecommendationResponse.builder()
                .type("ALL_VERIFIED")
                .severity("POSITIVE")
                .title("All properties verified")
                .description("Every property in your portfolio has passed all " +
                        "verification checks. Your data is complete.")
                .propertyId(null)
                .actionUrl(null)
                .actionLabel(null)
                .build());
    } else if (pendingCount > 0 && pendingCount <= 3) {
        // ── Rule 6: A few properties still pending — nudge ───────
        results.add(RecommendationResponse.builder()
                .type("PENDING_VERIFICATION")
                .severity("MEDIUM")
                .title(pendingCount + " propert" + (pendingCount > 1 ? "ies" : "y") + " awaiting verification")
                .description("Complete the missing fields on pending properties to pass all verification checks.")
                .propertyId(null)
                .actionUrl("/dashboard/property-search")
                .actionLabel("View pending")
                .build());
    }

    // Sort: HIGH → MEDIUM → LOW → POSITIVE
    results.sort((a, b) -> severityOrder(a.getSeverity()) - severityOrder(b.getSeverity()));

    return results;
}

private int severityOrder(String severity) {
    return switch (severity) {
        case "HIGH"     -> 0;
        case "MEDIUM"   -> 1;
        case "LOW"      -> 2;
        case "POSITIVE" -> 3;
        default         -> 4;
    };
}

private int countMissingFields(Property p) {
    int missing = 0;
    if (p.getAddress()      == null || p.getAddress().isBlank())      missing++;
    if (p.getCity()         == null || p.getCity().isBlank())         missing++;
    if (p.getState()        == null || p.getState().isBlank())        missing++;
    if (p.getZipCode()      == null || p.getZipCode().isBlank())      missing++;
    if (p.getPropertyType() == null || p.getPropertyType().isBlank()) missing++;
    if (p.getArea()         == null)                                   missing++;
    if (p.getMarketValue()  == null)                                   missing++;
    if (p.getYearBuilt()    == null)                                   missing++;
    if (p.getBedrooms()     == null)                                   missing++;
    if (p.getBathrooms()    == null)                                   missing++;
    return missing;
}
}