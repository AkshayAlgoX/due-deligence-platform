package com.realestate.duediligence.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponse> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyRequest request) {
        return ResponseEntity.ok(propertyService.updateProperty(id, request));
    }

    @PostMapping("/admin/reverify-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> reverifyAll() {
        int verified = propertyService.reverifyAllProperties();
        return ResponseEntity.ok(Map.of(
                "message", "Re-verification complete",
                "verifiedCount", verified));
    }
}
