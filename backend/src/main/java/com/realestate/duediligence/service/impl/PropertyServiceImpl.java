package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.dto.GeoPropertyResponse;
import com.realestate.duediligence.dto.PropertyRequest;
import com.realestate.duediligence.dto.PropertyResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.entity.AuditLog;
import com.realestate.duediligence.enums.AuditAction;
import com.realestate.duediligence.integration.AddressValidationService;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.AuditLogService;
import com.realestate.duediligence.service.PortfolioSnapshotService;
import com.realestate.duediligence.service.PropertyService;
import com.realestate.duediligence.service.PropertyVerificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements PropertyService {

    private final AddressValidationService      addressValidationService;
    private final PropertyRepository            propertyRepository;
    private final PropertyVerificationService   verificationService;
    private final UserRepository                userRepository;
    private final PortfolioSnapshotService      portfolioSnapshotService;
    private final AuditLogService               auditLogService;
    private final com.realestate.duediligence.service.GeocodingService geocodingService;
    
    // ── Add property ──────────────────────────────────────────────
    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboardStats", allEntries = true),
        @CacheEvict(value = "portfolioInsights", allEntries = true),
        @CacheEvict(value = "recentActivity", allEntries = true),
        @CacheEvict(value = "dashboardTrends", allEntries = true),
        @CacheEvict(value = "dashboardRecommendations", allEntries = true)
   })
   public PropertyResponse addProperty(PropertyRequest request) {
        if (!addressValidationService.validateAddress(request.getAddress())) {
            throw new RuntimeException("Invalid property address");
        }

        Property property = new Property();
        applyRequestToEntity(request, property);

        // Set createdBy from JWT principal
        User currentUser = resolveCurrentUser();
        if (currentUser != null) {
            property.setCreatedBy(currentUser);
        }

        // Auto-verify based on data completeness
        verificationService.verify(property);

        property.setCreatedAt(LocalDateTime.now());
        property.setUpdatedAt(LocalDateTime.now());

        Property saved = propertyRepository.save(property);

        saveAuditLog(
                currentUser,
                AuditAction.PROPERTY_CREATED,
                "PROPERTY",
                 saved.getId(),
                 "Property created");

        // Trigger real-time snapshot so chart updates immediately
        if (saved.getCreatedBy() != null) {
            portfolioSnapshotService.refreshSnapshotForUser(
                    saved.getCreatedBy().getId());
        }

        // Auto-geocode in background if coords missing
        if (saved.getLatitude() == null || saved.getLongitude() == null) {
            geocodingService.geocodePropertyAsync(saved.getId());
        }

        return mapToResponse(saved);
    }

    // ── Update property ───────────────────────────────────────────
    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboardStats", allEntries = true),
        @CacheEvict(value = "portfolioInsights", allEntries = true),
        @CacheEvict(value = "recentActivity", allEntries = true),
        @CacheEvict(value = "dashboardTrends", allEntries = true),
        @CacheEvict(value = "dashboardRecommendations", allEntries = true)
    })
    public PropertyResponse updateProperty(Long id, PropertyRequest request) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        // Ownership check — admin bypasses, others must own it
        User currentUser = resolveCurrentUser();
        if (!isAdmin(currentUser) && (currentUser == null || property.getCreatedBy() == null ||
                !property.getCreatedBy().getId().equals(currentUser.getId()))) {
            throw new RuntimeException("Property not found");
        }

        applyRequestToEntity(request, property);

        // Re-verify with updated data
        verificationService.verify(property);

        property.setUpdatedAt(LocalDateTime.now());

        Property saved = propertyRepository.save(property);

        saveAuditLog(
                 currentUser,
                 AuditAction.PROPERTY_UPDATED,
                 "PROPERTY",
                  saved.getId(),
                 "Property updated");

        // Trigger real-time snapshot
        if (saved.getCreatedBy() != null) {
            portfolioSnapshotService.refreshSnapshotForUser(
                    saved.getCreatedBy().getId());
        }

        // Auto-geocode in background if coords missing
        if (saved.getLatitude() == null || saved.getLongitude() == null) {
            geocodingService.geocodePropertyAsync(saved.getId());
        }

        return mapToResponse(saved);
    }

    // ══════════════════════════════════════════════════════════════
    // ── READ OPERATIONS (ADMIN sees ALL, others see OWN only) ─────
    // ══════════════════════════════════════════════════════════════

    @Override
    public List<PropertyResponse> getAllProperties() {
        User currentUser = resolveCurrentUser();
        if (currentUser == null) return List.of();

        // ⭐ ADMIN / LEGAL_REVIEWER / FINANCIAL_INSTITUTION see ALL properties
        if (canViewAllProperties(currentUser)) {
            return propertyRepository.findAll()
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // Regular users see only their own
        return propertyRepository.findByCreatedById(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PropertyResponse getPropertyById(Long id) {
        User currentUser = resolveCurrentUser();
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        // ⭐ ADMIN / LEGAL_REVIEWER / FINANCIAL_INSTITUTION can view ANY property
        if (canViewAllProperties(currentUser)) {

             saveAuditLog(
                      currentUser,
                      AuditAction.PROPERTY_VIEW,
                      "PROPERTY",
                      property.getId(),
                      "Viewed property");

             return mapToResponse(property);
}

        // Regular users can only view their own
        if (currentUser == null ||
                property.getCreatedBy() == null ||
                !property.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Property not found");
        }

        saveAuditLog(
                 currentUser,
                 AuditAction.PROPERTY_VIEW,
                 "PROPERTY",
                 property.getId(),
                 "Viewed property");

        return mapToResponse(property);
    }

    @Override
    public List<PropertyResponse> searchProperties(String query) {
        User currentUser = resolveCurrentUser();
        if (currentUser == null) return List.of();

        if (query == null || query.trim().isEmpty()) {
            return getAllProperties();
        }

        String q = query.toLowerCase().trim();

        // ⭐ ADMIN / LEGAL_REVIEWER / FINANCIAL_INSTITUTION search across ALL properties
        if (canViewAllProperties(currentUser)) {
            return propertyRepository.findAll()
                    .stream()
                    .filter(p -> matchesQuery(p, q))
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // Regular users search only their own
        return propertyRepository.searchByKeywordAndUser(q, currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PropertyResponse> getRecentProperties() {
        User currentUser = resolveCurrentUser();
        if (currentUser == null) return List.of();

        // ⭐ ADMIN / LEGAL_REVIEWER / FINANCIAL_INSTITUTION see 5 most recent across ALL users
        if (canViewAllProperties(currentUser)) {
            return propertyRepository.findAll()
                    .stream()
                    .sorted((a, b) -> {
                        LocalDateTime aTime = a.getCreatedAt();
                        LocalDateTime bTime = b.getCreatedAt();
                        if (aTime == null && bTime == null) return 0;
                        if (aTime == null) return 1;
                        if (bTime == null) return -1;
                        return bTime.compareTo(aTime);
                    })
                    .limit(5)
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // Regular users see only their own recent
        return propertyRepository.findTop5ByCreatedByIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Admin: re-verify all ──────────────────────────────────────
    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboardStats", allEntries = true),
        @CacheEvict(value = "portfolioInsights", allEntries = true),
        @CacheEvict(value = "recentActivity", allEntries = true),
        @CacheEvict(value = "dashboardTrends", allEntries = true),
        @CacheEvict(value = "dashboardRecommendations", allEntries = true)
    })
    public int reverifyAllProperties() {
        List<Property> all = propertyRepository.findAll();
        int verifiedCount = 0;

        for (Property p : all) {
            boolean passed = verificationService.verify(p);
            if (passed) verifiedCount++;
        }

        propertyRepository.saveAll(all);
        return verifiedCount;
    }

    // ══════════════════════════════════════════════════════════════
    // ── HELPERS ───────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════

    /**
     * Reads the email from the JWT principal (set by JwtAuthFilter)
     * and loads the User entity. Returns null if unauthenticated.
     */
    private User resolveCurrentUser() {
        try {
            Authentication auth =
                    SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return null;

            String email = auth.getName();
            return userRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Check if the current user has ADMIN role.
     * Centralized so we don't repeat the check in 6 places.
     */
    private boolean isAdmin(User user) {
        if (user == null || user.getRole() == null || user.getRole().getRoleName() == null) {
            return false;
        }
        return "ADMIN".equals(user.getRole().getRoleName().name());
    }

    private boolean canViewAllProperties(User user) {
        if (user == null || user.getRole() == null || user.getRole().getRoleName() == null) return false;
        String role = user.getRole().getRoleName().name();
        return "ADMIN".equals(role) || "LEGAL_REVIEWER".equals(role) || "FINANCIAL_INSTITUTION".equals(role);
    }

    /**
     * In-memory match for admin search across all properties.
     * Matches query against address, city, state, zipCode, propertyType.
     */
    private boolean matchesQuery(Property p, String query) {
        if (query == null || query.isEmpty()) return true;
        return (p.getAddress() != null && p.getAddress().toLowerCase().contains(query))
                || (p.getCity() != null && p.getCity().toLowerCase().contains(query))
                || (p.getState() != null && p.getState().toLowerCase().contains(query))
                || (p.getZipCode() != null && p.getZipCode().toLowerCase().contains(query))
                || (p.getPropertyType() != null && p.getPropertyType().toLowerCase().contains(query));
    }

    // ── Helper: Request → Entity ──────────────────────────────────
    private void applyRequestToEntity(PropertyRequest request, Property property) {
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setZipCode(request.getZipCode());
        property.setPropertyType(request.getPropertyType());
        property.setArea(request.getArea());
        property.setMarketValue(request.getMarketValue());
        property.setYearBuilt(request.getYearBuilt());
        property.setLotSize(request.getLotSize());
        property.setZoning(request.getZoning());
        property.setImageUrl(request.getImageUrl());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setStories(request.getStories());
        property.setStructureType(request.getStructureType());
        property.setCondition(request.getCondition());
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());
    }

    // ── Helper: Entity → Response DTO ─────────────────────────────
    private PropertyResponse mapToResponse(Property property) {
        PropertyResponse response = new PropertyResponse();
        response.setId(property.getId());
        response.setAddress(property.getAddress());
        response.setCity(property.getCity());
        response.setState(property.getState());
        response.setZipCode(property.getZipCode());
        response.setPropertyType(property.getPropertyType());
        response.setArea(property.getArea());
        response.setMarketValue(property.getMarketValue());
        response.setYearBuilt(property.getYearBuilt());
        response.setLotSize(property.getLotSize());
        response.setZoning(property.getZoning());
        response.setImageUrl(property.getImageUrl());
        response.setVerified(property.getVerified());
        response.setBedrooms(property.getBedrooms());
        response.setBathrooms(property.getBathrooms());
        response.setStories(property.getStories());
        response.setStructureType(property.getStructureType());
        response.setCondition(property.getCondition());
        response.setMissingFields(verificationService.findMissingFields(property));
        response.setTotalChecks(verificationService.getTotalChecks());
        response.setLatitude(property.getLatitude());
        response.setLongitude(property.getLongitude());
        return response;
    }

    // ── Geo endpoint ─────────────────────────────────────────────
    @Override
    public List<GeoPropertyResponse> getGeoProperties() {
        User currentUser = resolveCurrentUser();
        if (currentUser == null) return List.of();

        // ⭐ ADMIN / LEGAL_REVIEWER / FINANCIAL_INSTITUTION see ALL properties on map
        if (canViewAllProperties(currentUser)) {
            return propertyRepository.findAll()
                    .stream()
                    .filter(p -> p.getLatitude() != null && p.getLongitude() != null)
                    .map(this::mapToGeoResponse)
                    .collect(Collectors.toList());
        }

        // Regular users see only their own on map
        return propertyRepository.findAllWithCoordinatesByUser(currentUser.getId())
                .stream()
                .map(this::mapToGeoResponse)
                .collect(Collectors.toList());
    }

    private GeoPropertyResponse mapToGeoResponse(Property p) {
        return GeoPropertyResponse.builder()
                .id(p.getId())
                .address(p.getAddress())
                .city(p.getCity())
                .state(p.getState())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .marketValue(p.getMarketValue())
                .verified(p.getVerified())
                .propertyType(p.getPropertyType())
                .build();
    }

    // ── Delete property ────────────────────────────────────────────
    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboardStats", allEntries = true),
        @CacheEvict(value = "portfolioInsights", allEntries = true),
        @CacheEvict(value = "recentActivity", allEntries = true),
        @CacheEvict(value = "dashboardTrends", allEntries = true),
        @CacheEvict(value = "dashboardRecommendations", allEntries = true)
    })
    public void deleteProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        User currentUser = resolveCurrentUser();
        if (!isAdmin(currentUser) && (currentUser == null || property.getCreatedBy() == null ||
                !property.getCreatedBy().getId().equals(currentUser.getId()))) {
            throw new RuntimeException("Property not found");
        }

        // Refresh snapshot before deletion so it's reflected in history
        if (property.getCreatedBy() != null) {
            portfolioSnapshotService.refreshSnapshotForUser(
                    property.getCreatedBy().getId());
        }

        saveAuditLog(
                currentUser,
                AuditAction.PROPERTY_DELETED,
                "PROPERTY",
                property.getId(),
                "Property deleted");

        propertyRepository.delete(property);
    }

    // ── Admin backfill (batch geocode of legacy properties) ──
    @Override
    @Transactional
    public int backfillCoordinates() {
        List<Property> needsGeo = propertyRepository.findAll().stream()
                .filter(p -> p.getLatitude() == null || p.getLongitude() == null)
                .collect(Collectors.toList());

        if (needsGeo.isEmpty()) return 0;

        int geocoded = 0;
        for (Property p : needsGeo) {
            try {
                if (geocodingService.geocodeProperty(p)) {
                    propertyRepository.save(p);
                    geocoded++;
                }
                // Respect Nominatim rate limit: 1 req/sec
                Thread.sleep(1100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                // Continue with next property
            }
        }
        return geocoded;
    }

    private void saveAuditLog(
        User user,
        AuditAction action,
        String resourceType,
        Long resourceId,
        String details) {

    if (user == null) {
        return;
    }

    AuditLog log = new AuditLog();

    log.setUser(user);
    log.setAction(action);
    log.setResourceType(resourceType);
    log.setResourceId(resourceId);
    log.setDetailsJson(details);
    log.setIpAddress("127.0.0.1");
    log.setUserAgent("Property Service");
    log.setCreatedAt(LocalDateTime.now());

    auditLogService.save(log);
}}