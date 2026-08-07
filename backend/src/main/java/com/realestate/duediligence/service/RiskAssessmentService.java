// backend/src/main/java/com/realestate/duediligence/service/RiskAssessmentService.java
package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.RiskAssessmentResponse;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.dto.RiskHistoryDto;

/**
 * Service contract for risk assessment operations.
 *
 * The implementation in RiskAssessmentServiceImpl:
 *   - Delegates computation to RiskScoringEngine
 *   - Handles DB persistence (RiskAssessment + RiskFactor entities)
 *   - Marks old assessments isLatest=false before saving new
 *   - Never re-computes if a fresh assessment already exists (getOrCompute)
 */
public interface RiskAssessmentService {

    /**
     * Returns the latest risk assessment for a property.
     * If none exists, computes one and persists it.
     * If one already exists (isLatest=true), returns it immediately without re-scoring.
     *
     * @param propertyId the property to assess
     * @return summary risk response (no per-factor explanations)
     */
    RiskAssessmentResponse getOrCompute(Long propertyId);

    /**
     * Forces a fresh risk recalculation regardless of existing assessment.
     * Marks the previous latest assessment as isLatest=false.
     * Always calls the scoring engine — no cache bypass.
     *
     * @param propertyId the property to re-score
     * @return fresh summary risk response
     */
    RiskAssessmentResponse recalculate(Long propertyId);

    /**
     * Returns the full per-category breakdown with explanations.
     * If no assessment exists, computes one first (same as getOrCompute).
     *
     * @param propertyId the property to analyze
     * @return breakdown with all 6 factor explanations and recommendations
     */
    RiskBreakdownDto getBreakdown(Long propertyId);

    /**
     * Returns complete assessment history for a property, oldest first.
     * Includes all assessments (not just the latest).
     *
     * @param propertyId the property
     * @return history list with trend metadata
     */
    RiskHistoryDto getHistory(Long propertyId);
}