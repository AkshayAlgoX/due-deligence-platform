package com.realestate.duediligence.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.realestate.duediligence.dto.*;
import com.realestate.duediligence.service.ComparablePropertyService;
import com.realestate.duediligence.service.PropertyValuationService;

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
@Tag(name = "Comparable Properties & Valuation",
        description = "Comparable-property analysis and automated property valuation endpoints. " +
                "GET endpoints require authentication; POST endpoints additionally require " +
                "BUYER, REAL_ESTATE_AGENT, or ADMIN role.")
public class ComparablePropertyController {

    private final ComparablePropertyService comparablePropertyService;
    private final PropertyValuationService propertyValuationService;

    // ── Comparables ────────────────────────────────────────────────────────────

    @GetMapping("/{id}/comparables")
    @Operation(
            summary = "Get comparable properties",
            description = "Runs (or returns cached) a comparable-property analysis for the given property. " +
                    "Returns nearby properties with similarity scores, distance, and price-per-sqft deltas. " +
                    "Default radius is 5 km and limit is 10.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Analysis returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<ComparableAnalysisResponse> getComparables(
            @Parameter(description = "Target property ID", required = true) @PathVariable Long id,
            @Parameter(description = "Search radius in km (default 5)", example = "5") @RequestParam(required = false) Double radius,
            @Parameter(description = "Maximum comparable results (default 10)", example = "10") @RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(comparablePropertyService.getComparables(id, radius, limit));
    }

    @GetMapping("/{id}/comparables/map-data")
    @Operation(
            summary = "Get comparable properties for map rendering",
            description = "Returns a lightweight list of comparable properties suitable for rendering map pins. " +
                    "Includes lat/lng, price, and similarity score only.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Map pin data returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<ComparablePropertyDto>> getComparablesMapData(
            @Parameter(description = "Target property ID", required = true) @PathVariable Long id,
            @Parameter(description = "Search radius in km", example = "5") @RequestParam(required = false) Double radius) {
        return ResponseEntity.ok(comparablePropertyService.getMapData(id, radius));
    }

    @GetMapping("/{id}/comparables/{compId}/similarity")
    @Operation(
            summary = "Get similarity detail for one comparable",
            description = "Returns the full similarity breakdown between the target property and a specific comparable.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Similarity detail returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Property or comparable not found")
    })
    public ResponseEntity<ComparablePropertyDto> getSimilarity(
            @Parameter(description = "Target property ID", required = true) @PathVariable Long id,
            @Parameter(description = "Comparable property ID", required = true) @PathVariable Long compId) {
        return ResponseEntity.ok(comparablePropertyService.getSimilarity(id, compId));
    }

    @PostMapping("/{id}/comparables/search")
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    @Operation(
            summary = "Advanced comparable search with filters",
            description = "Runs a fresh comparable-property search using custom filter criteria " +
                    "(price range, area range, property type, max distance). " +
                    "Results are persisted as a new ComparableAnalysis record.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Filtered analysis returned"),
            @ApiResponse(responseCode = "400", description = "Invalid filter parameters"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Insufficient role"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<ComparableAnalysisResponse> searchComparables(
            @Parameter(description = "Target property ID", required = true) @PathVariable Long id,
            @Valid @RequestBody ComparableSearchRequest request) {
        return ResponseEntity.ok(comparablePropertyService.searchComparables(id, request));
    }

    @GetMapping("/{id}/comparables/price-trends")
    @Operation(
            summary = "Get price trends from comparables",
            description = "Returns a time-series of price-per-sqft values derived from the comparable set, " +
                    "useful for rendering the 12-month price trend chart.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Price trend data returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<PriceTrendDto>> getPriceTrends(
            @Parameter(description = "Target property ID", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(comparablePropertyService.getPriceTrends(id));
    }

    // ── Valuation ──────────────────────────────────────────────────────────────

    @GetMapping("/{id}/valuation")
    @Operation(
            summary = "Get latest property valuation",
            description = "Returns the most recent automated valuation for the property. " +
                    "Includes estimated value, confidence range (low/high), and the valuation method used.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Valuation returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Property not found or no valuation computed yet")
    })
    public ResponseEntity<PropertyValuationResponse> getLatestValuation(
            @Parameter(description = "Target property ID", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(propertyValuationService.getLatestValuation(id));
    }

    @PostMapping("/{id}/valuation/calculate")
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    @Operation(
            summary = "Calculate / recalculate property valuation",
            description = "Triggers a fresh valuation computation using all three methods " +
                    "(comparable, cost, income) and persists the result. " +
                    "Replaces any existing latest valuation.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "New valuation computed and returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Insufficient role"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<PropertyValuationResponse> calculateValuation(
            @Parameter(description = "Target property ID", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(propertyValuationService.calculateValuation(id));
    }

    @GetMapping("/{id}/valuation/methods-breakdown")
    @Operation(
            summary = "Get valuation methods breakdown",
            description = "Returns individual estimates from each of the three valuation methods " +
                    "(COMPARABLE, COST, INCOME) for side-by-side comparison.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Methods breakdown returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<ValuationBreakdownDto> getMethodsBreakdown(
            @Parameter(description = "Target property ID", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(propertyValuationService.getMethodsBreakdown(id));
    }

    @GetMapping("/{id}/valuation/price-history")
    @Operation(
            summary = "Get valuation price history",
            description = "Returns all past valuation records for the property in chronological order, " +
                    "useful for rendering the price-history chart.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Price history returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<PropertyValuationResponse>> getPriceHistory(
            @Parameter(description = "Target property ID", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(propertyValuationService.getPriceHistory(id));
    }
}
