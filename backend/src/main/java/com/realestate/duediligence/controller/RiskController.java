// backend/src/main/java/com/realestate/duediligence/controller/RiskController.java
package com.realestate.duediligence.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.RiskScoreResponse;
import com.realestate.duediligence.service.RiskScoringService;

import lombok.RequiredArgsConstructor;

/**
 * Risk scoring endpoints.
 *
 * GET /api/properties/{id}/risk
 *   Returns the computed risk score for a single property.
 *   Uses cached aggregation data — fast on repeated calls.
 *   Accessible to any authenticated user.
 */
@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class RiskController {

    private final RiskScoringService riskScoringService;

    @GetMapping("/{id}/risk")
    public ResponseEntity<RiskScoreResponse> getPropertyRisk(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(riskScoringService.computeRisk(id));
        } catch (RuntimeException e) {
            // Property not found — aggregation service throws RuntimeException
            return ResponseEntity.notFound().build();
        }
    }
}