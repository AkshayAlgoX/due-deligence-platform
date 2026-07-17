package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.PropertyRequest;
import com.realestate.duediligence.dto.PropertyResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.integration.AddressValidationService;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.service.PropertyService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements PropertyService {

    private final AddressValidationService addressValidationService;
    private final PropertyRepository propertyRepository;

    @Override
    public PropertyResponse addProperty(PropertyRequest request) {
        if (!addressValidationService.validateAddress(request.getAddress())) {
            throw new RuntimeException("Invalid property address");
        }

        Property property = new Property();

        // Existing fields
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setZipCode(request.getZipCode());
        property.setPropertyType(request.getPropertyType());
        property.setArea(request.getArea());
        property.setMarketValue(request.getMarketValue());

        // ── NEW FIELDS (optional in request) ─────────────────────────
        property.setYearBuilt(request.getYearBuilt());
        property.setLotSize(request.getLotSize());
        property.setZoning(request.getZoning());
        property.setImageUrl(request.getImageUrl());
        property.setVerified(request.getVerified() != null ? request.getVerified() : true);
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setStories(request.getStories());
        property.setStructureType(request.getStructureType());
        property.setCondition(request.getCondition());

        property.setCreatedAt(LocalDateTime.now());
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

    /**
     * Smart search across address, city, state, zipCode, propertyType.
     * Falls back to returning all properties if query is empty.
     */
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

    // ── Helper: Entity → Response DTO (ALL fields) ──────────────────
    private PropertyResponse mapToResponse(Property property) {
        PropertyResponse response = new PropertyResponse();

        // Existing fields
        response.setId(property.getId());
        response.setAddress(property.getAddress());
        response.setCity(property.getCity());
        response.setState(property.getState());
        response.setZipCode(property.getZipCode());
        response.setPropertyType(property.getPropertyType());
        response.setArea(property.getArea());
        response.setMarketValue(property.getMarketValue());

        // New fields
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

        return response;
    }
}