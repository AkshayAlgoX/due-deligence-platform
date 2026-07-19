package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.dto.PropertyRequest;
import com.realestate.duediligence.dto.PropertyResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.integration.AddressValidationService;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.service.PropertyService;
import com.realestate.duediligence.service.PropertyVerificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements PropertyService {

    private final AddressValidationService addressValidationService;
    private final PropertyRepository propertyRepository;
    private final PropertyVerificationService verificationService;

    @Override
    public PropertyResponse addProperty(PropertyRequest request) {
        if (!addressValidationService.validateAddress(request.getAddress())) {
            throw new RuntimeException("Invalid property address");
        }

        Property property = new Property();
        applyRequestToEntity(request, property);

        // ── Auto-verify based on data completeness ──────────────────
        // Rules run automatically — the "verified" flag from request is ignored
        verificationService.verify(property);

        property.setCreatedAt(LocalDateTime.now());
        property.setUpdatedAt(LocalDateTime.now());

        Property saved = propertyRepository.save(property);
        return mapToResponse(saved);
    }

    /**
     * Update an existing property. Re-runs verification automatically —
     * this powers the "Pending → Edit → Verified" user flow.
     */
    @Override
    @Transactional
    public PropertyResponse updateProperty(Long id, PropertyRequest request) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        applyRequestToEntity(request, property);

        // ── Re-verify with updated data ────────────────────────────
        verificationService.verify(property);

        property.setUpdatedAt(LocalDateTime.now());

        Property saved = propertyRepository.save(property);
        return mapToResponse(saved);
    }

    @Override
    public List<PropertyResponse> getAllProperties() {
        return propertyRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        return mapToResponse(property);
    }

    @Override
    public List<PropertyResponse> searchProperties(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllProperties();
        }
        String q = query.toLowerCase().trim();
        return propertyRepository.searchByKeyword(q)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Admin-only: re-verify ALL existing properties.
     * Used once after deploying the verification engine to fix legacy data
     * where every property was blindly marked as verified.
     */
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

    @Override
public List<PropertyResponse> getRecentProperties() {
    return propertyRepository.findTop5ByOrderByCreatedAtDesc()
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
}
    // ── Helper: Request → Entity (used by both create & update) ────
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
        // Note: verified flag is set by verificationService, NOT copied from request
    }

    // ── Helper: Entity → Response DTO ──────────────────────────────
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

        // ── Include missing fields for transparency ─────────────────
        response.setMissingFields(verificationService.findMissingFields(property));
        response.setTotalChecks(verificationService.getTotalChecks());

        return response;
    }
}