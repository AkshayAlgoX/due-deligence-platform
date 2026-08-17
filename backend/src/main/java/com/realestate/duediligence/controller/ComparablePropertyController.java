package com.realestate.duediligence.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.ComparableAnalysisResponse;
import com.realestate.duediligence.dto.ComparablePropertyDto;
import com.realestate.duediligence.dto.ComparableSearchRequest;
import com.realestate.duediligence.dto.PriceTrendDto;
import com.realestate.duediligence.dto.PropertyValuationResponse;
import com.realestate.duediligence.dto.ValuationBreakdownDto;
import com.realestate.duediligence.service.ComparablePropertyService;
import com.realestate.duediligence.service.PropertyValuationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Role policy (matches PropertyController's pattern):
 *  - GET endpoints: any authenticated user (no @PreAuthorize, falls through
 *    to SecurityConfig's default `.anyRequest().authenticated()`)
 *  - POST endpoints (search, calculate): restricted to BUYER / REAL_ESTATE_AGENT / ADMIN,
 *    same roles PropertyController uses for its write endpoints.
 */
@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class ComparablePropertyController {

    private final ComparablePropertyService comparablePropertyService;
    private final PropertyValuationService propertyValuationService;

    // ── Comparables ────────────────────────────────────────────────

    @GetMapping("/{id}/comparables")
    public ResponseEntity<ComparableAnalysisResponse> getComparables(
            @PathVariable Long id,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(comparablePropertyService.getComparables(id, radius, limit));
    }

    @GetMapping("/{id}/comparables/map-data")
    public ResponseEntity<List<ComparablePropertyDto>> getComparablesMapData(
            @PathVariable Long id,
            @RequestParam(required = false) Double radius) {
        return ResponseEntity.ok(comparablePropertyService.getMapData(id, radius));
    }

    @GetMapping("/{id}/comparables/{compId}/similarity")
    public ResponseEntity<ComparablePropertyDto> getSimilarity(
            @PathVariable Long id,
            @PathVariable Long compId) {
        return ResponseEntity.ok(comparablePropertyService.getSimilarity(id, compId));
    }

    @PostMapping("/{id}/comparables/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ComparableAnalysisResponse> searchComparables(
            @PathVariable Long id,
            @Valid @RequestBody ComparableSearchRequest request) {
        return ResponseEntity.ok(comparablePropertyService.searchComparables(id, request));
    }

    @GetMapping("/{id}/comparables/price-trends")
    public ResponseEntity<List<PriceTrendDto>> getPriceTrends(@PathVariable Long id) {
        return ResponseEntity.ok(comparablePropertyService.getPriceTrends(id));
    }

    // ── Valuation ──────────────────────────────────────────────────

    @GetMapping("/{id}/valuation")
    public ResponseEntity<PropertyValuationResponse> getLatestValuation(@PathVariable Long id) {
        return ResponseEntity.ok(propertyValuationService.getLatestValuation(id));
    }

    @PostMapping("/{id}/valuation/calculate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PropertyValuationResponse> calculateValuation(@PathVariable Long id) {
        return ResponseEntity.ok(propertyValuationService.calculateValuation(id));
    }

    @GetMapping("/{id}/valuation/methods-breakdown")
    public ResponseEntity<ValuationBreakdownDto> getMethodsBreakdown(@PathVariable Long id) {
        return ResponseEntity.ok(propertyValuationService.getMethodsBreakdown(id));
    }

    @GetMapping("/{id}/valuation/price-history")
    public ResponseEntity<List<PropertyValuationResponse>> getPriceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(propertyValuationService.getPriceHistory(id));
    }
}
