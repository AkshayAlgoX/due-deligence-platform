package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.PropertyValuationResponse;
import com.realestate.duediligence.dto.ValuationBreakdownDto;

public interface PropertyValuationService {

    /** Returns the most recently calculated valuation, or 404 if none exists yet. */
    PropertyValuationResponse getLatestValuation(Long propertyId);

    /** Runs a fresh valuation calculation and persists it as a new row. */
    PropertyValuationResponse calculateValuation(Long propertyId);

    /** Breaks down the 3 valuation methods (comparable/cost/income) individually. */
    ValuationBreakdownDto getMethodsBreakdown(Long propertyId);

    /** All past valuations for this property, most recent first. */
    List<PropertyValuationResponse> getPriceHistory(Long propertyId);
}
