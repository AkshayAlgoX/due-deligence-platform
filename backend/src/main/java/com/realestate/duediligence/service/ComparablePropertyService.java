package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.ComparableAnalysisResponse;
import com.realestate.duediligence.dto.ComparablePropertyDto;
import com.realestate.duediligence.dto.ComparableSearchRequest;
import com.realestate.duediligence.dto.PriceTrendDto;

public interface ComparablePropertyService {

    /** Runs a comparable search using default/basic filters (radius + limit only). */
    ComparableAnalysisResponse getComparables(Long propertyId, Double radiusKm, Integer limit);

    /** Lightweight version for map pins — same search, flattened to a list. */
    List<ComparablePropertyDto> getMapData(Long propertyId, Double radiusKm);

    /** Similarity score between the subject property and one specific candidate. */
    ComparablePropertyDto getSimilarity(Long propertyId, Long compId);

    /** Full advanced-filter search (price range, bedrooms, property type, etc). */
    ComparableAnalysisResponse searchComparables(Long propertyId, ComparableSearchRequest request);

    /** Monthly price-per-sqft / median-price trend from nearby comparable properties. */
    List<PriceTrendDto> getPriceTrends(Long propertyId);
}
