package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    // ────────────────────────────────────────────────────────────────
    // Dashboard statistics
    // ────────────────────────────────────────────────────────────────

    @Override
    @Cacheable(
       value = "dashboardStats",
        key = "T(org.springframework.security.core.context.SecurityContextHolder)"
            + ".getContext().getAuthentication().getName()"
    )
    public DashboardStatsResponse getStats() {

        User currentUser = resolveCurrentUser();
        boolean admin = isAdmin();

        long totalProperties;
        long verifiedProperties;
        long pendingProperties;

        if (admin || currentUser == null) {

            totalProperties = propertyRepository.count();
            verifiedProperties = propertyRepository.countByVerifiedTrue();
            pendingProperties = propertyRepository.countByVerifiedFalse();

        } else {

            Long userId = currentUser.getId();

            totalProperties =
                    propertyRepository.countByCreatedByIdLong(userId);

            verifiedProperties =
                    propertyRepository.countVerifiedByUserLong(userId);

            pendingProperties =
                    propertyRepository.countPendingByUserLong(userId);
        }

        long totalUsers = admin ? userRepository.count() : 1;

        LocalDateTime thirtyDaysAgo =
                LocalDateTime.now().minusDays(30);

        long activeUsers =
                admin
                        ? userRepository.countActiveUsersSince(thirtyDaysAgo)
                        : 1;

        return DashboardStatsResponse.builder()
                .totalProperties(totalProperties)
                .verifiedProperties(verifiedProperties)
                .pendingProperties(pendingProperties)
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .reportsGenerated(0)
                .activeAlerts(0)
                .trends(
                    DashboardStatsResponse.DashboardTrends.builder()
                        .propertiesGrowth(0)
                        .reportsGrowth(0)
                        .riskChange(0)
                        .alertsChange(0)
                        .build()
                )
                .build();
    }

    // ────────────────────────────────────────────────────────────────
    // Portfolio insights
    // ────────────────────────────────────────────────────────────────

    @Override
    @Cacheable(
        value = "portfolioInsights",
        key = "T(org.springframework.security.core.context.SecurityContextHolder)"
            + ".getContext().getAuthentication().getName()"
    )
    public PortfolioInsightsResponse getPortfolioInsights() {

        User currentUser = resolveCurrentUser();
        boolean admin = isAdmin();

        double totalValue;
        double avgValue;
        long totalCities;

        List<Property> topByValue;
        List<Object[]> typeRows;
        List<Object[]> cityRows;

        if (admin || currentUser == null) {

            totalValue = propertyRepository.sumMarketValue();
            avgValue = propertyRepository.averageMarketValue();
            totalCities = propertyRepository.countDistinctCities();

            topByValue = propertyRepository.findTopByMarketValue();
            typeRows = propertyRepository.aggregateByType();
            cityRows = propertyRepository.aggregateByCity();

        } else {

            Long userId = currentUser.getId();

            Double sum =
                    propertyRepository.sumMarketValueByUser(userId);

            totalValue = sum != null ? sum : 0;

            avgValue =
                    propertyRepository.averageMarketValueByUser(userId);

            Integer cityCount =
                    propertyRepository.countDistinctCitiesByUser(userId);

            totalCities = cityCount != null ? cityCount : 0;

            topByValue =
                    propertyRepository.findTopByMarketValueForUser(userId);

            typeRows =
                    propertyRepository.aggregateByTypeForUser(userId);

            cityRows =
                    propertyRepository.aggregateByCityForUser(userId);
        }

        PortfolioInsightsResponse.HighlightProperty highlight = null;

        if (!topByValue.isEmpty()) {

            Property property = topByValue.get(0);

            highlight =
                    PortfolioInsightsResponse.HighlightProperty.builder()
                            .id(property.getId())
                            .address(property.getAddress())
                            .city(property.getCity())
                            .marketValue(
                                    property.getMarketValue() != null
                                            ? property.getMarketValue()
                                            : 0
                            )
                            .build();
        }

        List<PortfolioInsightsResponse.TypeDistribution> byType =
                typeRows.stream()
                        .map(row ->
                                PortfolioInsightsResponse.TypeDistribution
                                        .builder()
                                        .propertyType(
                                                row[0] != null
                                                        ? (String) row[0]
                                                        : "Unknown"
                                        )
                                        .count((Long) row[1])
                                        .totalValue(
                                                row[2] != null
                                                        ? ((Number) row[2]).doubleValue()
                                                        : 0
                                        )
                                        .build()
                        )
                        .collect(Collectors.toList());

        List<PortfolioInsightsResponse.CityDistribution> byCity =
                cityRows.stream()
                        .limit(10)
                        .map(row ->
                                PortfolioInsightsResponse.CityDistribution
                                        .builder()
                                        .city((String) row[0])
                                        .count((Long) row[1])
                                        .build()
                        )
                        .collect(Collectors.toList());

        String topCity =
                byCity.isEmpty()
                        ? null
                        : byCity.get(0).getCity();

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
    // Recent activity
    // ────────────────────────────────────────────────────────────────

    @Override
    @Cacheable(
        value = "recentActivity",
        key = "T(org.springframework.security.core.context.SecurityContextHolder)"
            + ".getContext().getAuthentication().getName()"
            + " + '_' + #limit"
    )
    public List<ActivityItemResponse> getRecentActivity(int limit) {

        User currentUser = resolveCurrentUser();

        List<Property> recent =
                (isAdmin() || currentUser == null)
                        ? propertyRepository.findTop30ByOrderByUpdatedAtDesc()
                        : propertyRepository
                            .findTop30ByCreatedByIdOrderByUpdatedAtDesc(
                                    currentUser.getId()
                            );

        List<ActivityItemResponse> items = new ArrayList<>();

        for (Property property : recent) {

            LocalDateTime created = property.getCreatedAt();
            LocalDateTime updated = property.getUpdatedAt();

            String type;
            LocalDateTime timestamp;

            if (created != null
                    && updated != null
                    && created.equals(updated)) {

                type = "PROPERTY_ADDED";
                timestamp = created;

            } else if (Boolean.TRUE.equals(property.getVerified())) {

                type = "PROPERTY_VERIFIED";
                timestamp =
                        updated != null
                                ? updated
                                : created;

            } else {

                type = "PROPERTY_UPDATED";
                timestamp =
                        updated != null
                                ? updated
                                : created;
            }

            String actorName = null;

            User actor = property.getCreatedBy();

            if (actor != null) {

                actorName =
                        actor.getFullName() != null
                                && !actor.getFullName().isBlank()
                                        ? actor.getFullName()
                                        : actor.getEmail();
            }

            items.add(
                    ActivityItemResponse.builder()
                            .type(type)
                            .propertyId(property.getId())
                            .propertyAddress(property.getAddress())
                            .propertyCity(property.getCity())
                            .timestamp(timestamp)
                            .actorName(actorName)
                            .build()
            );
        }

        return items.stream()
                .filter(item -> item.getTimestamp() != null)
                .sorted(
                    Comparator.comparing(
                        ActivityItemResponse::getTimestamp
                    ).reversed()
                )
                .limit(limit)
                .collect(Collectors.toList());
    }

    // ────────────────────────────────────────────────────────────────
    // Trends
    // ────────────────────────────────────────────────────────────────

    @Override
    @Cacheable(
        value = "dashboardTrends",
        key = "T(org.springframework.security.core.context.SecurityContextHolder)"
            + ".getContext().getAuthentication().getName()"
    )
    public DashboardTrendsResponse getTrends() {

        User currentUser = resolveCurrentUser();
        boolean admin = isAdmin();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekAgo = now.minusDays(7);
        LocalDateTime twoWeeksAgo = now.minusDays(14);

        long propsThisWeek;
        long propsLastWeek;
        long verifiedThisWeek;
        long verifiedLastWeek;

        if (admin || currentUser == null) {

            propsThisWeek =
                    propertyRepository.countByCreatedAtBetween(
                            weekAgo,
                            now
                    );

            propsLastWeek =
                    propertyRepository.countByCreatedAtBetween(
                            twoWeeksAgo,
                            weekAgo
                    );

            verifiedThisWeek =
                    propertyRepository
                            .countByVerifiedTrueAndUpdatedAtBetween(
                                    weekAgo,
                                    now
                            );

            verifiedLastWeek =
                    propertyRepository
                            .countByVerifiedTrueAndUpdatedAtBetween(
                                    twoWeeksAgo,
                                    weekAgo
                            );

        } else {

            Long userId = currentUser.getId();

            propsThisWeek =
                    propertyRepository
                            .countByCreatedByIdAndCreatedAtBetween(
                                    userId,
                                    weekAgo,
                                    now
                            );

            propsLastWeek =
                    propertyRepository
                            .countByCreatedByIdAndCreatedAtBetween(
                                    userId,
                                    twoWeeksAgo,
                                    weekAgo
                            );

            verifiedThisWeek =
                    propertyRepository
                            .countVerifiedByUserBetween(
                                    userId,
                                    weekAgo,
                                    now
                            );

            verifiedLastWeek =
                    propertyRepository
                            .countVerifiedByUserBetween(
                                    userId,
                                    twoWeeksAgo,
                                    weekAgo
                            );
        }

        long usersThisWeek =
                admin
                        ? userRepository.countByCreatedAtBetween(
                                weekAgo,
                                now
                        )
                        : 0;

        long usersLastWeek =
                admin
                        ? userRepository.countByCreatedAtBetween(
                                twoWeeksAgo,
                                weekAgo
                        )
                        : 0;

        return DashboardTrendsResponse.builder()
                .propertiesThisWeek(propsThisWeek)
                .propertiesLastWeek(propsLastWeek)
                .propertiesGrowthPct(
                        pctChange(propsThisWeek, propsLastWeek)
                )
                .verifiedThisWeek(verifiedThisWeek)
                .verifiedLastWeek(verifiedLastWeek)
                .verifiedGrowthPct(
                        pctChange(
                                verifiedThisWeek,
                                verifiedLastWeek
                        )
                )
                .newUsersThisWeek(usersThisWeek)
                .newUsersLastWeek(usersLastWeek)
                .usersGrowthPct(
                        pctChange(
                                usersThisWeek,
                                usersLastWeek
                        )
                )
                .build();
    }

    // ────────────────────────────────────────────────────────────────
    // Recommendations
    //
    // PERFORMANCE OPTIMIZATION:
    //
    // Previously this method called findAll()/findByCreatedById()
    // and then used Java Streams to calculate:
    //
    // - missing photos
    // - missing areas
    // - city count
    // - verified count
    // - pending count
    //
    // The optimized implementation performs those COUNT operations
    // directly in the database.
    //
    // Only the small number of properties required to display the
    // recommendation target are fetched.
    // ────────────────────────────────────────────────────────────────

    @Override
    @Cacheable(
         value = "dashboardRecommendations",
         key = "T(org.springframework.security.core.context.SecurityContextHolder)"
             + ".getContext().getAuthentication().getName()"
    )
    public List<RecommendationResponse> getRecommendations() {

        User currentUser = resolveCurrentUser();
        boolean admin = isAdmin();

        long noPhotoCount;
        long noAreaCount;
        long cityCount;
        long pendingCount;
        long verifiedCount;

        List<Property> mostIncompleteResults;

        Pageable firstResult =
                PageRequest.of(0, 1);

        if (admin || currentUser == null) {

            // Database-side COUNT queries.
            noPhotoCount =
                    propertyRepository
                            .countPropertiesWithoutPhoto();

            noAreaCount =
                    propertyRepository
                            .countPropertiesWithoutArea();

            cityCount =
                    propertyRepository
                            .countDistinctCitiesForRecommendations();

            verifiedCount =
                    propertyRepository
                            .countVerifiedPropertiesForRecommendations();

            pendingCount =
                    propertyRepository
                            .countPendingPropertiesForRecommendations(); 
                            

            // Fetch only the single most incomplete property.
            mostIncompleteResults =
                    propertyRepository
                            .findMostIncompleteProperty(
                                    firstResult
                            );

        } else {

            Long userId = currentUser.getId();

            // Database-side user-scoped COUNT queries.
            noPhotoCount =
                    propertyRepository
                            .countPropertiesWithoutPhotoByUser(
                                    userId
                            );

            noAreaCount =
                    propertyRepository
                            .countPropertiesWithoutAreaByUser(
                                    userId
                            );

            cityCount =
                    propertyRepository
                            .countDistinctCitiesByUserForRecommendations(
                                    userId
                            );

            verifiedCount =
                    propertyRepository
                            .countVerifiedPropertiesForRecommendationsByUser(
                                    userId
                            );

            pendingCount =
                    propertyRepository
                            .countPendingPropertiesByUser(
                                    userId
                            );

            // Fetch only the single most incomplete property.
            mostIncompleteResults =
                    propertyRepository
                            .findMostIncompletePropertyByUser(
                                    userId,
                                    firstResult
                            );
        }

        List<RecommendationResponse> recs =
                new ArrayList<>();

        // ────────────────────────────────────────────────────────────
        // Incomplete data
        // ────────────────────────────────────────────────────────────

        Property mostIncomplete =
                mostIncompleteResults.isEmpty()
                        ? null
                        : mostIncompleteResults.get(0);

        int maxMissing =
                mostIncomplete != null
                        ? countMissingFields(mostIncomplete)
                        : 0;

        if (mostIncomplete != null && maxMissing > 0) {

            recs.add(
                    RecommendationResponse.builder()
                            .type("INCOMPLETE_DATA")
                            .severity("HIGH")
                            .titleKey(
                                    "recommendations.items.incompleteData.title"
                            )
                            .titleParams(
                                    Map.of(
                                            "fieldCount",
                                            maxMissing,
                                            "address",
                                            mostIncomplete.getAddress() != null
                                                    ? mostIncomplete.getAddress()
                                                    : ""
                                    )
                            )
                            .descriptionKey(
                                    "recommendations.items.incompleteData.description"
                            )
                            .descriptionParams(Map.of())
                            .actionLabelKey(
                                    "recommendations.items.incompleteData.actionLabel"
                            )
                            .propertyId(
                                    mostIncomplete.getId()
                            )
                            .actionUrl(
                                    "/dashboard/property-search"
                            )
                            .build()
            );
        }

        // ────────────────────────────────────────────────────────────
        // Missing photo
        // ────────────────────────────────────────────────────────────

        if (noPhotoCount > 0) {

            List<Property> noPhotoResults;

            if (admin || currentUser == null) {

                noPhotoResults =
                        propertyRepository
                                .findPropertyWithoutPhoto(
                                        firstResult
                                );

            } else {

                noPhotoResults =
                        propertyRepository
                                .findPropertyWithoutPhotoByUser(
                                        currentUser.getId(),
                                        firstResult
                                );
            }

            Property noPhotoProperty =
                    noPhotoResults.isEmpty()
                            ? null
                            : noPhotoResults.get(0);

            recs.add(
                    RecommendationResponse.builder()
                            .type("MISSING_PHOTO")
                            .severity("MEDIUM")
                            .titleKey(
                                    "recommendations.items.missingPhoto.title"
                            )
                            .titleParams(
                                    Map.of(
                                            "count",
                                            noPhotoCount
                                    )
                            )
                            .descriptionKey(
                                    "recommendations.items.missingPhoto.description"
                            )
                            .descriptionParams(Map.of())
                            .actionLabelKey(
                                    "recommendations.items.missingPhoto.actionLabel"
                            )
                            .propertyId(
                                    noPhotoProperty != null
                                            ? noPhotoProperty.getId()
                                            : null
                            )
                            .actionUrl(
                                    "/dashboard/property-search"
                            )
                            .build()
            );
        }

        // ────────────────────────────────────────────────────────────
        // Missing area
        // ────────────────────────────────────────────────────────────

        if (noAreaCount > 0) {

            List<Property> noAreaResults;

            if (admin || currentUser == null) {

                noAreaResults =
                        propertyRepository
                                .findPropertyWithoutArea(
                                        firstResult
                                );

            } else {

                noAreaResults =
                        propertyRepository
                                .findPropertyWithoutAreaByUser(
                                        currentUser.getId(),
                                        firstResult
                                );
            }

            Property noAreaProperty =
                    noAreaResults.isEmpty()
                            ? null
                            : noAreaResults.get(0);

            recs.add(
                    RecommendationResponse.builder()
                            .type("MISSING_AREA")
                            .severity("MEDIUM")
                            .titleKey(
                                    "recommendations.items.missingArea.title"
                            )
                            .titleParams(
                                    Map.of(
                                            "count",
                                            noAreaCount
                                    )
                            )
                            .descriptionKey(
                                    "recommendations.items.missingArea.description"
                            )
                            .descriptionParams(Map.of())
                            .actionLabelKey(
                                    "recommendations.items.missingArea.actionLabel"
                            )
                            .propertyId(
                                    noAreaProperty != null
                                            ? noAreaProperty.getId()
                                            : null
                            )
                            .actionUrl(
                                    "/dashboard/property-search"
                            )
                            .build()
            );
        }

        // ────────────────────────────────────────────────────────────
        // Diverse portfolio
        // ────────────────────────────────────────────────────────────

        if (cityCount >= 3) {

            recs.add(
                    RecommendationResponse.builder()
                            .type("DIVERSE_PORTFOLIO")
                            .severity("LOW")
                            .titleKey(
                                    "recommendations.items.diversePortfolio.title"
                            )
                            .titleParams(
                                    Map.of(
                                            "count",
                                            cityCount
                                    )
                            )
                            .descriptionKey(
                                    "recommendations.items.diversePortfolio.description"
                            )
                            .descriptionParams(Map.of())
                            .actionLabelKey(null)
                            .propertyId(null)
                            .actionUrl(null)
                            .build()
            );
        }

        // ────────────────────────────────────────────────────────────
        // All verified
        // ────────────────────────────────────────────────────────────
        //
        // Previous implementation:
        //
        // !all.isEmpty() &&
        // all.stream().allMatch(...)
        //
        // Optimized implementation:
        //
        // verifiedCount > 0 && pendingCount == 0
        //
        // This avoids loading every property just to determine whether
        // all properties are verified.
        // ────────────────────────────────────────────────────────────

        boolean allVerified =
                verifiedCount > 0
                        && pendingCount == 0;

        if (allVerified) {

            recs.add(
                    RecommendationResponse.builder()
                            .type("ALL_VERIFIED")
                            .severity("POSITIVE")
                            .titleKey(
                                    "recommendations.items.allVerified.title"
                            )
                            .titleParams(Map.of())
                            .descriptionKey(
                                    "recommendations.items.allVerified.description"
                            )
                            .descriptionParams(Map.of())
                            .actionLabelKey(null)
                            .propertyId(null)
                            .actionUrl(null)
                            .build()
            );
        }

        // ────────────────────────────────────────────────────────────
        // Pending verification
        // ────────────────────────────────────────────────────────────

        if (pendingCount > 0) {

            recs.add(
                    RecommendationResponse.builder()
                            .type("PENDING_VERIFICATION")
                            .severity("MEDIUM")
                            .titleKey(
                                    "recommendations.items.pendingVerification.title"
                            )
                            .titleParams(
                                    Map.of(
                                            "count",
                                            pendingCount
                                    )
                            )
                            .descriptionKey(
                                    "recommendations.items.pendingVerification.description"
                            )
                            .descriptionParams(Map.of())
                            .actionLabelKey(
                                    "recommendations.items.pendingVerification.actionLabel"
                            )
                            .propertyId(null)
                            .actionUrl(
                                    "/dashboard/property-search"
                            )
                            .build()
            );
        }

        // ────────────────────────────────────────────────────────────
        // Sort recommendations by severity
        // ────────────────────────────────────────────────────────────

        recs.sort(
                Comparator.comparingInt(
                        recommendation ->
                                severityOrder(
                                        recommendation.getSeverity()
                                )
                )
        );

        return recs;
    }

    // ────────────────────────────────────────────────────────────────
    // Helpers
    // ────────────────────────────────────────────────────────────────

    private int pctChange(long current, long previous) {

        if (previous == 0) {
            return current > 0 ? 100 : 0;
        }

        double percentage =
                ((double) (current - previous) / previous) * 100.0;

        int rounded =
                (int) Math.round(percentage);

        if (rounded > 999) {
            return 999;
        }

        if (rounded < -999) {
            return -999;
        }

        return rounded;
    }

    private int severityOrder(String severity) {

        return switch (severity) {
            case "HIGH" -> 0;
            case "MEDIUM" -> 1;
            case "POSITIVE" -> 2;
            default -> 3;
        };
    }

    private int countMissingFields(Property property) {

        int missing = 0;

        if (property.getAddress() == null
                || property.getAddress().trim().length() <= 5) {
            missing++;
        }

        if (isBlankField(property.getCity())) {
            missing++;
        }

        if (isBlankField(property.getState())) {
            missing++;
        }

        if (isBlankField(property.getZipCode())) {
            missing++;
        }

        if (isBlankField(property.getPropertyType())) {
            missing++;
        }

        if (property.getMarketValue() == null
                || property.getMarketValue() <= 0) {
            missing++;
        }

        if (property.getArea() == null
                || property.getArea() <= 0) {
            missing++;
        }

        return missing;
    }

    private boolean isBlankField(String value) {
        return value == null || value.isBlank();
    }

    private boolean isAdmin() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return authentication != null
                && authentication.getAuthorities()
                        .stream()
                        .anyMatch(
                                authority ->
                                        authority.getAuthority()
                                                .equals("ROLE_ADMIN")
                        );
    }

    private User resolveCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return null;
        }

        String email =
                authentication.getName();

        if (email == null || email.isBlank()) {
            return null;
        }

        return userRepository
                .findByEmail(email)
                .orElse(null);
    }
}