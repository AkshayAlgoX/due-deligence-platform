package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
import com.realestate.duediligence.util.RoleUtils;

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
        User currentUser = resolveCurrentUser();
        boolean admin = canViewAll();

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
    // getPortfolioInsights
    // ────────────────────────────────────────────────────────────────

    @Override
    public PortfolioInsightsResponse getPortfolioInsights() {
        User currentUser = resolveCurrentUser();
        boolean admin = canViewAll();

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
    // getRecentActivity
    // ────────────────────────────────────────────────────────────────

    @Override
    public List<ActivityItemResponse> getRecentActivity(int limit) {
        User currentUser = resolveCurrentUser();
        List<Property> recent = (canViewAll() || currentUser == null)
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
    // getTrends
    // ────────────────────────────────────────────────────────────────

    @Override
    public DashboardTrendsResponse getTrends() {
        User currentUser = resolveCurrentUser();
        boolean admin = canViewAll();

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
    // getRecommendations — 6 rules, all real data — i18n keys only
    // ────────────────────────────────────────────────────────────────

    @Override
    public List<RecommendationResponse> getRecommendations() {

        User currentUser = resolveCurrentUser();

        List<Property> all = (canViewAll() || currentUser == null)
                ? propertyRepository.findAll()
                : propertyRepository.findByCreatedById(currentUser.getId());

        List<RecommendationResponse> recs = new ArrayList<>();

        // ── Rule 1: Incomplete data ──────────────────────────────────────────
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
            recs.add(RecommendationResponse.builder()
                    .type("INCOMPLETE_DATA")
                    .severity("HIGH")
                    .titleKey("recommendations.items.incompleteData.title")
                    .titleParams(Map.of(
                            "fieldCount", maxMissing,
                            "address", mostIncomplete.getAddress() != null ? mostIncomplete.getAddress() : ""
                    ))
                    .descriptionKey("recommendations.items.incompleteData.description")
                    .descriptionParams(Map.of())
                    .actionLabelKey("recommendations.items.incompleteData.actionLabel")
                    .propertyId(mostIncomplete.getId())
                    .actionUrl("/dashboard/property-search")
                    .build());
        }

        // ── Rule 2: Missing photo ────────────────────────────────────────────
        long noPhotoCount = all.stream()
                .filter(p -> p.getImageUrl() == null || p.getImageUrl().isBlank())
                .count();

        if (noPhotoCount > 0) {
            Property noPhotoProperty = all.stream()
                    .filter(p -> p.getImageUrl() == null || p.getImageUrl().isBlank())
                    .findFirst()
                    .orElse(null);

            recs.add(RecommendationResponse.builder()
                    .type("MISSING_PHOTO")
                    .severity("MEDIUM")
                    .titleKey("recommendations.items.missingPhoto.title")
                    .titleParams(Map.of("count", noPhotoCount))
                    .descriptionKey("recommendations.items.missingPhoto.description")
                    .descriptionParams(Map.of())
                    .actionLabelKey("recommendations.items.missingPhoto.actionLabel")
                    .propertyId(noPhotoProperty != null ? noPhotoProperty.getId() : null)
                    .actionUrl("/dashboard/property-search")
                    .build());
        }

        // ── Rule 3: Missing area ─────────────────────────────────────────────
        long noAreaCount = all.stream()
                .filter(p -> p.getArea() == null || p.getArea() <= 0)
                .count();

        if (noAreaCount > 0) {
            Property noAreaProperty = all.stream()
                    .filter(p -> p.getArea() == null || p.getArea() <= 0)
                    .findFirst()
                    .orElse(null);

            recs.add(RecommendationResponse.builder()
                    .type("MISSING_AREA")
                    .severity("MEDIUM")
                    .titleKey("recommendations.items.missingArea.title")
                    .titleParams(Map.of("count", noAreaCount))
                    .descriptionKey("recommendations.items.missingArea.description")
                    .descriptionParams(Map.of())
                    .actionLabelKey("recommendations.items.missingArea.actionLabel")
                    .propertyId(noAreaProperty != null ? noAreaProperty.getId() : null)
                    .actionUrl("/dashboard/property-search")
                    .build());
        }

        // ── Rule 4: Diverse portfolio ────────────────────────────────────────
        long cityCount = all.stream()
                .map(Property::getCity)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .count();

        if (cityCount >= 3) {
            recs.add(RecommendationResponse.builder()
                    .type("DIVERSE_PORTFOLIO")
                    .severity("LOW")
                    .titleKey("recommendations.items.diversePortfolio.title")
                    .titleParams(Map.of("count", cityCount))
                    .descriptionKey("recommendations.items.diversePortfolio.description")
                    .descriptionParams(Map.of())
                    .actionLabelKey(null)
                    .propertyId(null)
                    .actionUrl(null)
                    .build());
        }

        // ── Rule 5: All verified ─────────────────────────────────────────────
        boolean allVerified = !all.isEmpty()
                && all.stream().allMatch(p -> Boolean.TRUE.equals(p.getVerified()));

        if (allVerified) {
            recs.add(RecommendationResponse.builder()
                    .type("ALL_VERIFIED")
                    .severity("POSITIVE")
                    .titleKey("recommendations.items.allVerified.title")
                    .titleParams(Map.of())
                    .descriptionKey("recommendations.items.allVerified.description")
                    .descriptionParams(Map.of())
                    .actionLabelKey(null)
                    .propertyId(null)
                    .actionUrl(null)
                    .build());
        }

        // ── Rule 6: Pending verification ────────────────────────────────────
        long pendingCount = all.stream()
                .filter(p -> !Boolean.TRUE.equals(p.getVerified()))
                .count();

        if (pendingCount > 0) {
            recs.add(RecommendationResponse.builder()
                    .type("PENDING_VERIFICATION")
                    .severity("MEDIUM")
                    .titleKey("recommendations.items.pendingVerification.title")
                    .titleParams(Map.of("count", pendingCount))
                    .descriptionKey("recommendations.items.pendingVerification.description")
                    .descriptionParams(Map.of())
                    .actionLabelKey("recommendations.items.pendingVerification.actionLabel")
                    .propertyId(null)
                    .actionUrl("/dashboard/property-search")
                    .build());
        }

        recs.sort(Comparator.comparingInt(r -> severityOrder(r.getSeverity())));
        return recs;
    }

    // ────────────────────────────────────────────────────────────────
    // Private helpers
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

    private int severityOrder(String severity) {
        return switch (severity) {
            case "HIGH"     -> 0;
            case "MEDIUM"   -> 1;
            case "POSITIVE" -> 2;
            default         -> 3;
        };
    }

    private int countMissingFields(Property p) {
        int missing = 0;
        if (p.getAddress() == null || p.getAddress().trim().length() <= 5) missing++;
        if (isBlankField(p.getCity()))          missing++;
        if (isBlankField(p.getState()))         missing++;
        if (isBlankField(p.getZipCode()))       missing++;
        if (isBlankField(p.getPropertyType()))  missing++;
        if (p.getMarketValue() == null || p.getMarketValue() <= 0) missing++;
        if (p.getArea() == null || p.getArea() <= 0) missing++;
        return missing;
    }

    private boolean isBlankField(String s) {
        return s == null || s.isBlank();
    }

    /** True if current user has ADMIN role. */
    private boolean canViewAll() {
        User user = resolveCurrentUser();
        return user != null && RoleUtils.canViewAllProperties(user);
    }

    /** Resolves the currently authenticated user, or null if none. */
    private User resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String email = auth.getName();
        if (email == null || email.isBlank()) return null;
        return userRepository.findByEmail(email).orElse(null);
    }
}