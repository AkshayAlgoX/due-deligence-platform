package com.realestate.duediligence.aggregation;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

/**
 * GET /api/properties/{id}/aggregated
 *
 * Returns unified property view including:
 *   - Base property data (from our DB)
 *   - Ownership + land registry (mock for India)
 *   - Property tax history (mock)
 *   - Zoning info (mock)
 *   - Flood zone (mock)
 *   - Permits (mock)
 *   - Environmental / AQI (real CPCB API — coming next batch)
 *
 * Response guaranteed to arrive within 8 seconds even if providers hang.
 */
@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyAggregationController {

    private final PropertyAggregationService aggregationService;

    @GetMapping("/{id}/aggregated")
    public ResponseEntity<AggregatedPropertyResponse> getAggregated(@PathVariable Long id) {
        return ResponseEntity.ok(aggregationService.aggregate(id));
    }
}