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

        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setZipCode(request.getZipCode());
        property.setPropertyType(request.getPropertyType());
        property.setArea(request.getArea());
        property.setMarketValue(request.getMarketValue());

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

    @Override
    public List<PropertyResponse> searchByCity(String city) {

        return propertyRepository.findByCityIgnoreCase(city)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

    }

    private PropertyResponse mapToResponse(Property property) {

        return new PropertyResponse(
                property.getId(),
                property.getAddress(),
                property.getCity(),
                property.getState(),
                property.getZipCode(),
                property.getPropertyType(),
                property.getArea(),
                property.getMarketValue());

    }

}