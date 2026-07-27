package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
import com.realestate.duediligence.dto.RecommendationResponse;
import java.util.Map;

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
        User currentUser = resolveCurrentUser();
        boolean admin = isAdmin();

        long totalProperties, verifiedProperties, pendingProperties;

        if (admin || currentUser == null) {
            totalProperties    = propertyRepository.count();
            verifiedProperties = propertyRepository.countByVerifiedTrue();
            pendingProperties  = propertyRepository.countByVerifiedFalse();
        } else {
            Long uid = currentUser.getId();
            totalProperties    = propertyRepository.countByCreatedByIdLong(uid);
            verifiedProperties = propertyRepository.countVerifiedByUserLong(uid);
            pendingProperties  = propertyRepository.countPendingByUserLong(uid);
        }

        long totalUsers  = admin ? userRepository.count() : 1;
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long activeUsers = admin ? userRepository.countActiveUsersSince(thirtyDaysAgo) : 1;

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
        User currentUser = resolveCurrentUser();
        boolean admin = isAdmin();

        double totalValue, avgValue;
        long totalCities;
        List<Property> topByValue;
        List<Object[]> typeRows, cityRows;

        if (admin || currentUser == null) {
            totalValue  = propertyRepository.sumMarketValue();
            avgValue    = propertyRepository.averageMarketValue();
            totalCities = propertyRepository.countDistinctCities();
            topByValue  = propertyRepository.findTopByMarketValue();
            typeRows    = propertyRepository.aggregateByType();
            cityRows    = propertyRepository.aggregateByCity();
        } else {
            Long uid = currentUser.getId();
            Double sum = propertyRepository.sumMarketValueByUser(uid);
            totalValue  = sum != null ? sum : 0;
            avgValue    = propertyRepository.averageMarketValueByUser(uid);
            Integer cc  = propertyRepository.countDistinctCitiesByUser(uid);
            totalCities = cc != null ? cc : 0;
            topByValue  = propertyRepository.findTopByMarketValueForUser(uid);
            typeRows    = propertyRepository.aggregateByTypeForUser(uid);
            cityRows    = propertyRepository.aggregateByCityForUser(uid);
        }

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
        List<PortfolioInsightsResponse.TypeDistribution> byType = typeRows.stream()
                .map(row -> PortfolioInsightsResponse.TypeDistribution.builder()
                        .propertyType(row[0] != null ? (String) row[0] : "Unknown")
                        .count((Long) row[1])
                        .totalValue(row[2] != null ? ((Number) row[2]).doubleValue() : 0)
                        .build())
                .collect(Collectors.toList());

        // Distribution by city (top 10)
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
        User currentUser = resolveCurrentUser();
        List<Property> recent = (isAdmin() || currentUser == null)
                ? propertyRepository.findTop30ByOrderByUpdatedAtDesc()
                : propertyRepository.findTop30ByCreatedByIdOrderByUpdatedAtDesc(currentUser.getId());

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
        User currentUser = resolveCurrentUser();
        boolean admin = isAdmin();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekAgo = now.minusDays(7);
        LocalDateTime twoWeeksAgo = now.minusDays(14);

        long propsThisWeek, propsLastWeek, verifiedThisWeek, verifiedLastWeek;

        if (admin || currentUser == null) {
            propsThisWeek    = propertyRepository.countByCreatedAtBetween(weekAgo, now);
            propsLastWeek    = propertyRepository.countByCreatedAtBetween(twoWeeksAgo, weekAgo);
            verifiedThisWeek = propertyRepository.countByVerifiedTrueAndUpdatedAtBetween(weekAgo, now);
            verifiedLastWeek = propertyRepository.countByVerifiedTrueAndUpdatedAtBetween(twoWeeksAgo, weekAgo);
        } else {
            Long uid = currentUser.getId();
            propsThisWeek    = propertyRepository.countByCreatedByIdAndCreatedAtBetween(uid, weekAgo, now);
            propsLastWeek    = propertyRepository.countByCreatedByIdAndCreatedAtBetween(uid, twoWeeksAgo, weekAgo);
            verifiedThisWeek = propertyRepository.countVerifiedByUserBetween(uid, weekAgo, now);
            verifiedLastWeek = propertyRepository.countVerifiedByUserBetween(uid, twoWeeksAgo, weekAgo);
        }

        long usersThisWeek = admin ? userRepository.countByCreatedAtBetween(weekAgo, now) : 0;
        long usersLastWeek = admin ? userRepository.countByCreatedAtBetween(twoWeeksAgo, weekAgo) : 0;

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
    User currentUser = resolveCurrentUser();
    List<Property> all = (isAdmin() || currentUser == null)
            ? propertyRepository.findAll()
            : propertyRepository.findByCreatedById(currentUser.getId());

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

    /** Resolve current user from JWT. Returns null if unauthenticated. */
    private User resolveCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return null;
            return userRepository.findByEmail(auth.getName()).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    /** True if current user has ADMIN role. */
    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}