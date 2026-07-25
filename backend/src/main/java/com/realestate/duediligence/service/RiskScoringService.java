// backend/src/main/java/com/realestate/duediligence/service/RiskScoringService.java
package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.RiskScoreResponse;

public interface RiskScoringService {

    /**
     * Compute risk score for a property.
     * Internally calls the aggregation service (already cached),
     * so this is fast on repeated calls.
     */
    RiskScoreResponse computeRisk(Long propertyId);
}