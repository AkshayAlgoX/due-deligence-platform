package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.dto.GeoPropertyResponse;
import com.realestate.duediligence.dto.PropertyRequest;
import com.realestate.duediligence.dto.PropertyResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.integration.AddressValidationService;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
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
    private final com.realestate.duediligence.service.GeocodingService geocodingService;  // ← NEW

    // ── Add property ──────────────────────────────────────────────
    @Override
    @Transactional
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

        // Trigger real-time snapshot so chart updates immediately
        if (saved.getCreatedBy() != null) {
            portfolioSnapshotService.refreshSnapshotForUser(
                    saved.getCreatedBy().getId());
        }
        // ── NEW: auto-geocode in background if coords missing ──
if (saved.getLatitude() == null || saved.getLongitude() == null) {
    geocodingService.geocodePropertyAsync(saved.getId());
}

        return mapToResponse(saved);
    }

    // ── Update property ───────────────────────────────────────────
    @Override
    @Transactional
    public PropertyResponse updateProperty(Long id, PropertyRequest request) {
                Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        // Ownership check — admin bypasses, others must own it
        User currentUser = resolveCurrentUser();
        boolean isAdmin = currentUser != null && 
                "ADMIN".equals(currentUser.getRole().getRoleName().name());
        if (!isAdmin && (currentUser == null || property.getCreatedBy() == null ||
                !property.getCreatedBy().getId().equals(currentUser.getId()))) {
            throw new RuntimeException("Property not found");
        }

        applyRequestToEntity(request, property);

        // Re-verify with updated data — powers the "Pending → Edit → Verified" flow
        verificationService.verify(property);

        property.setUpdatedAt(LocalDateTime.now());

        Property saved = propertyRepository.save(property);

        // Trigger real-time snapshot
        if (saved.getCreatedBy() != null) {
            portfolioSnapshotService.refreshSnapshotForUser(
                    saved.getCreatedBy().getId());
        }
        // ── NEW: auto-geocode in background if coords missing ──
if (saved.getLatitude() == null || saved.getLongitude() == null) {
    geocodingService.geocodePropertyAsync(saved.getId());
}

        
        return mapToResponse(saved);
    }

    // ── Read operations (unchanged) ───────────────────────────────
        @Override
    public List<PropertyResponse> getAllProperties() {
        User currentUser = resolveCurrentUser();
        if (currentUser == null) return List.of();
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
        if (currentUser == null || 
             property.getCreatedBy() == null || 
             !property.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Property not found");
        }
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
        return propertyRepository.searchByKeywordAndUser(q, currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

        @Override
    public List<PropertyResponse> getRecentProperties() {
        User currentUser = resolveCurrentUser();
        if (currentUser == null) return List.of();
        return propertyRepository.findTop5ByCreatedByIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Admin: re-verify all ──────────────────────────────────────
    @Override
    @Transactional
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

    // ── Helper: resolve current user from JWT ─────────────────────
    /**
     * Reads the email from the JWT principal (set by JwtAuthFilter)
     * and loads the User entity. Returns null if unauthenticated —
     * callers check before using.
     */
    private User resolveCurrentUser() {
        try {
            Authentication auth =
                    SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return null;

            String email = auth.getName(); // JWT subject = email
            return userRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null; // Never crash on this
        }
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
        // verified is set by verificationService — never copied from request
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
return propertyRepository.findAllWithCoordinatesByUser(currentUser.getId())
        .stream()
        .map(p -> GeoPropertyResponse.builder()
                .id(p.getId())
                .address(p.getAddress())
                .city(p.getCity())
                .state(p.getState())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .marketValue(p.getMarketValue())
                .verified(p.getVerified())
                .propertyType(p.getPropertyType())
                .build())
        .collect(Collectors.toList());
}

    // ── Delete property ────────────────────────────────────────────
    @Override
    @Transactional
    public void deleteProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        User currentUser = resolveCurrentUser();
        boolean isAdmin = currentUser != null && 
                "ADMIN".equals(currentUser.getRole().getRoleName().name());
        if (!isAdmin && (currentUser == null || property.getCreatedBy() == null ||
                !property.getCreatedBy().getId().equals(currentUser.getId()))) {
            throw new RuntimeException("Property not found");
        }

        // Refresh snapshot before deletion so it's reflected in history
        if (property.getCreatedBy() != null) {
            portfolioSnapshotService.refreshSnapshotForUser(
                    property.getCreatedBy().getId());
        }

        propertyRepository.delete(property);
    }

// ── Admin backfill (one-time geocode of legacy properties) ──
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
/** Extract a numeric value from JSON string after a given key marker. */
private Double extractJsonNumber(String json, String marker) {
    int idx = json.indexOf(marker);
    if (idx < 0) return null;
    int start = idx + marker.length();
    int end = json.indexOf("\"", start);
    if (end < 0) return null;
    try {
        return Double.parseDouble(json.substring(start, end));
    } catch (NumberFormatException e) {
        return null;
    }
}
}