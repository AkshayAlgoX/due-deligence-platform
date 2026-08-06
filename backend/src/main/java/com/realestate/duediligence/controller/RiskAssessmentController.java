// backend/src/main/java/com/realestate/duediligence/controller/RiskAssessmentController.java
package com.realestate.duediligence.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.RiskAssessmentResponse;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.dto.RiskHistoryDto;
import com.realestate.duediligence.service.RiskAssessmentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * Risk Assessment REST API.
 *
 * All endpoints require authentication (JWT Bearer token).
 * No additional role requirement — any authenticated user may access
 * risk data for properties they own (access control in service layer
 * via PropertyAggregationService which already enforces ownership).
 *
 * Endpoints:
 *   GET  /api/properties/{propertyId}/risk              → summary (fast)
 *   GET  /api/properties/{propertyId}/risk/breakdown    → full breakdown with explanations
 *   GET  /api/properties/{propertyId}/risk/history      → all historical assessments
 *   POST /api/properties/{propertyId}/risk/recalculate  → force fresh computation
 *
 * Error handling:
 *   404 → property not found or access denied (PropertyAggregationService throws RuntimeException)
 *   500 → unexpected scoring failure (logged, not swallowed)
 */
@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Tag(name = "Risk Assessment", description = "Property risk scoring and analysis endpoints")
public class RiskAssessmentController {

    private static final Logger log = LoggerFactory.getLogger(RiskAssessmentController.class);

    private final RiskAssessmentService riskAssessmentService;

    // ── GET /api/properties/{propertyId}/risk ─────────────────────

    @GetMapping("/{propertyId}/risk")
    @Operation(
            summary = "Get risk assessment summary",
            description = "Returns the current risk score for a property. " +
                    "Computes on first call, returns cached result on subsequent calls. " +
                    "Use /breakdown for full per-category explanations.")
    public ResponseEntity<RiskAssessmentResponse> getRiskAssessment(
            @Parameter(description = "Property ID", required = true)
            @PathVariable Long propertyId) {
        try {
            RiskAssessmentResponse response = riskAssessmentService.getOrCompute(propertyId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.warn("Risk assessment failed for property {}: {}", propertyId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ── GET /api/properties/{propertyId}/risk/breakdown ───────────

    @GetMapping("/{propertyId}/risk/breakdown")
    @Operation(
            summary = "Get full risk breakdown",
            description = "Returns per-category scores with human-readable explanations " +
                    "and actionable recommendations. Powers the risk explainability cards in UI.")
    public ResponseEntity<RiskBreakdownDto> getRiskBreakdown(
            @Parameter(description = "Property ID", required = true)
            @PathVariable Long propertyId) {
        try {
            RiskBreakdownDto breakdown = riskAssessmentService.getBreakdown(propertyId);
            return ResponseEntity.ok(breakdown);
        } catch (RuntimeException e) {
            log.warn("Risk breakdown failed for property {}: {}", propertyId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ── GET /api/properties/{propertyId}/risk/history ─────────────

    @GetMapping("/{propertyId}/risk/history")
    @Operation(
            summary = "Get risk assessment history",
            description = "Returns all historical risk assessments for a property, " +
                    "oldest first. Includes score delta for trend analysis.")
    public ResponseEntity<RiskHistoryDto> getRiskHistory(
            @Parameter(description = "Property ID", required = true)
            @PathVariable Long propertyId) {
        try {
            RiskHistoryDto history = riskAssessmentService.getHistory(propertyId);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            log.warn("Risk history failed for property {}: {}", propertyId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ── POST /api/properties/{propertyId}/risk/recalculate ────────

    @PostMapping("/{propertyId}/risk/recalculate")
    @Operation(
            summary = "Force risk recalculation",
            description = "Bypasses existing assessment and forces a fresh computation " +
                    "from current provider data. Previous assessment is preserved in history. " +
                    "Use sparingly — this triggers a full PropertyAggregationService call.")
    public ResponseEntity<RiskAssessmentResponse> recalculateRisk(
            @Parameter(description = "Property ID", required = true)
            @PathVariable Long propertyId) {
        try {
            log.info("Risk recalculation requested for property {}", propertyId);
            RiskAssessmentResponse response = riskAssessmentService.recalculate(propertyId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.warn("Risk recalculation failed for property {}: {}", propertyId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}