package com.realestate.duediligence.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.realestate.duediligence.dto.GeoPropertyResponse;
import com.realestate.duediligence.dto.PropertyRequest;
import com.realestate.duediligence.dto.PropertyResponse;
import com.realestate.duediligence.service.PropertyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Tag(name = "Properties",
        description = "Core CRUD for property listings. " +
                "Read operations are accessible to all authenticated users. " +
                "Write operations require BUYER, REAL_ESTATE_AGENT, or ADMIN role. " +
                "Admin-only operations (reverify, geocoding backfill) require ADMIN.")
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    @Operation(
            summary = "Add a new property",
            description = "Creates a new property listing. The authenticated user is recorded as the creator. " +
                    "Address geocoding (lat/lng) is triggered asynchronously after save.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Property created — full response returned"),
            @ApiResponse(responseCode = "400", description = "Validation failure"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Insufficient role")
    })
    public PropertyResponse addProperty(@Valid @RequestBody PropertyRequest request) {
        return propertyService.addProperty(request);
    }

    @GetMapping
    @Operation(
            summary = "List all properties",
            description = "Returns all properties on the platform. " +
                    "Each authenticated user effectively sees only their own properties via service-layer filtering.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Property list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public List<PropertyResponse> getAllProperties() {
        return propertyService.getAllProperties();
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get property by ID",
            description = "Returns the full details of a single property including metadata, area, valuation, and labels.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Property returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public PropertyResponse getPropertyById(
            @Parameter(description = "Property ID", required = true) @PathVariable Long id) {
        return propertyService.getPropertyById(id);
    }

    @GetMapping("/search")
    @Operation(
            summary = "Search properties by keyword",
            description = "Full-text search across address, city, state, zip code, and property type fields. " +
                    "Case-insensitive substring match.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Matching properties returned (may be empty)"),
            @ApiResponse(responseCode = "400", description = "Missing query parameter"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public List<PropertyResponse> searchProperties(
            @Parameter(description = "Search keyword", required = true, example = "Chennai") @RequestParam String query) {
        return propertyService.searchProperties(query);
    }

    @GetMapping("/recent")
    @Operation(
            summary = "Get 5 most recently added properties",
            description = "Returns the 5 most recently created properties, newest first. " +
                    "Used to populate the dashboard's 'Recent Properties' table.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recent properties returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public ResponseEntity<List<PropertyResponse>> getRecentProperties() {
        return ResponseEntity.ok(propertyService.getRecentProperties());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    @Operation(
            summary = "Update a property",
            description = "Updates all editable fields of an existing property. " +
                    "Service layer validates ownership before applying changes.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Property updated — updated response returned"),
            @ApiResponse(responseCode = "400", description = "Validation failure"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Insufficient role or not the owner"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<PropertyResponse> updateProperty(
            @Parameter(description = "Property ID", required = true) @PathVariable Long id,
            @Valid @RequestBody PropertyRequest request) {
        return ResponseEntity.ok(propertyService.updateProperty(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    @Operation(
            summary = "Delete a property",
            description = "Permanently deletes a property and all cascade-related data " +
                    "(risk assessments, reports, comparables, valuations, labels). " +
                    "Service layer validates ownership.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Property deleted — no content returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Insufficient role or not the owner"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<Void> deleteProperty(
            @Parameter(description = "Property ID", required = true) @PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/reverify-all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Admin — re-verify all properties",
            description = "Triggers a full re-verification run across all properties, updating the verified flag. " +
                    "Run synchronously — may be slow on large datasets. Use sparingly.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Re-verification complete — verified count returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public ResponseEntity<Map<String, Object>> reverifyAll() {
        int verified = propertyService.reverifyAllProperties();
        return ResponseEntity.ok(Map.of("message", "Re-verification complete", "verifiedCount", verified));
    }

    @GetMapping("/geo")
    @Operation(
            summary = "Get properties as geo markers",
            description = "Returns a lightweight list of properties that have latitude/longitude set, " +
                    "suitable for rendering map pins. Only id, lat, lng, address, risk level, and market value are returned.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Geo markers returned (may be empty if no coordinates exist)"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public ResponseEntity<List<GeoPropertyResponse>> getGeoProperties() {
        return ResponseEntity.ok(propertyService.getGeoProperties());
    }

    @PostMapping("/admin/backfill-coordinates")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Admin — backfill missing coordinates via Nominatim",
            description = "One-time endpoint to geocode all legacy properties that are missing lat/lng. " +
                    "Rate-limited to 1 request/second (Nominatim ToS). " +
                    "Runs synchronously — call from Postman, not the UI.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Geocoding complete — geocoded count returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public ResponseEntity<Map<String, Object>> backfillCoordinates() {
        int geocoded = propertyService.backfillCoordinates();
        return ResponseEntity.ok(Map.of("message", "Geocoding complete", "geocodedCount", geocoded));
    }
}
