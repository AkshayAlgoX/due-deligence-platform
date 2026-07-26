package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.Property;

public interface GeocodingService {

    /**
     * Geocode a single property using Nominatim.
     * Runs in a background thread — never blocks the caller.
     * Silent failure — if geocoding fails, property just stays without coordinates.
     */
    void geocodePropertyAsync(Long propertyId);

    /**
     * Synchronously geocode one property.
     * Used by the backfill batch job which respects 1 req/sec rate limit.
     * Returns true if coordinates were set.
     */
    boolean geocodeProperty(Property property);
}