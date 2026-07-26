package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.GeoPropertyResponse;
import com.realestate.duediligence.dto.PropertyRequest;
import com.realestate.duediligence.dto.PropertyResponse;

public interface PropertyService {

    PropertyResponse addProperty(PropertyRequest request);

    PropertyResponse updateProperty(Long id, PropertyRequest request);

    List<PropertyResponse> getAllProperties();

    PropertyResponse getPropertyById(Long id);

    List<PropertyResponse> searchProperties(String query);

    int reverifyAllProperties();

    List<PropertyResponse> getRecentProperties();

    List<GeoPropertyResponse> getGeoProperties();

    /**
     * Admin-only: backfill missing lat/lon by geocoding via Nominatim.
     * Respects 1 req/sec rate limit. Returns count of properties geocoded.
     */
    int backfillCoordinates();
}