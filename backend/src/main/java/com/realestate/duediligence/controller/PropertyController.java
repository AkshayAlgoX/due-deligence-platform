package com.realestate.duediligence.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.GeoPropertyResponse;
import com.realestate.duediligence.dto.PropertyRequest;
import com.realestate.duediligence.dto.PropertyResponse;
import com.realestate.duediligence.service.PropertyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    public PropertyResponse addProperty(@Valid @RequestBody PropertyRequest request) {
        return propertyService.addProperty(request);
    }

    @GetMapping
    public List<PropertyResponse> getAllProperties() {
        return propertyService.getAllProperties();
    }

    @GetMapping("/{id}")
    public PropertyResponse getPropertyById(@PathVariable Long id) {
        return propertyService.getPropertyById(id);
    }

    /**
     * Smart search across address, city, state, zipCode, propertyType.
     * @param query — search keyword (matches any field)
     */
    @GetMapping("/search")
    public List<PropertyResponse> searchProperties(@RequestParam String query) {
        return propertyService.searchProperties(query);
    }

    /**
     * GET /api/properties/recent
     * Returns the 5 most recently added properties (newest first).
     * Used by dashboard "Recent properties" table.
     */
    @GetMapping("/recent")
    public ResponseEntity<List<PropertyResponse>> getRecentProperties() {
        return ResponseEntity.ok(propertyService.getRecentProperties());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    public ResponseEntity<PropertyResponse> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyRequest request) {
        return ResponseEntity.ok(propertyService.updateProperty(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/reverify-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> reverifyAll() {
        int verified = propertyService.reverifyAllProperties();
        return ResponseEntity.ok(Map.of(
                "message", "Re-verification complete",
                "verifiedCount", verified));
    }
    /**
 * GET /api/properties/geo
 * Returns lightweight geo markers for map view.
 * Only includes properties with latitude + longitude set.
 */
@GetMapping("/geo")
public ResponseEntity<List<GeoPropertyResponse>> getGeoProperties() {
    return ResponseEntity.ok(propertyService.getGeoProperties());
}

/**
 * POST /api/properties/admin/backfill-coordinates
 * One-time endpoint to geocode legacy properties via Nominatim.
 * Rate-limited to 1 req/sec — will take ~30 seconds for 30 properties.
 * Runs synchronously — don't call from UI, use Postman only.
 */
@PostMapping("/admin/backfill-coordinates")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Map<String, Object>> backfillCoordinates() {
    int geocoded = propertyService.backfillCoordinates();
    return ResponseEntity.ok(Map.of(
            "message", "Geocoding complete",
            "geocodedCount", geocoded));
}
}