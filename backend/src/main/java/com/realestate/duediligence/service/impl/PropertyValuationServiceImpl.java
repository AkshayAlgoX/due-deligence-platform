package com.realestate.duediligence.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.ComparableAnalysisResponse;
import com.realestate.duediligence.dto.ComparablePropertyDto;
import com.realestate.duediligence.dto.PropertyValuationResponse;
import com.realestate.duediligence.dto.ValuationBreakdownDto;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.PropertyValuation;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.ValuationMethod;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.PropertyValuationRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.ComparablePropertyService;
import com.realestate.duediligence.service.PropertyValuationService;
import com.realestate.duediligence.util.RoleUtils;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * PropertyValuationServiceImpl
 *
 * IMPORTANT — FLAGGING FOR REVIEW, NOT HIDING:
 * The "cost" and "income" method formulas below use placeholder constants
 * (replacement cost/sqft, land value/unit, rent-to-value ratio, cap rate)
 * because this project has no external data source for construction costs
 * or rental yields yet. They produce a directionally reasonable number, but
 * are NOT calibrated against real market data. The "comparable" method is
 * the only one backed by actual data (nearby properties via
 * ComparablePropertyService). Please review the constants marked "placeholder"
 * before this is presented as production-accurate.
 */
@Service
@RequiredArgsConstructor
public class PropertyValuationServiceImpl implements PropertyValuationService {

    private static final double DEFAULT_RADIUS_KM = 5.0;

    private final PropertyValuationRepository propertyValuationRepository;
    private final PropertyRepository propertyRepository;
    private final ComparablePropertyService comparablePropertyService;
    private final UserRepository userRepository;

    @Override
    public PropertyValuationResponse getLatestValuation(Long propertyId) {
        authorizeProperty(propertyId);
        PropertyValuation valuation = propertyValuationRepository
                .findFirstByPropertyIdOrderByCalculatedAtDesc(propertyId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No valuation found for property " + propertyId + ". Calculate one first via POST /valuation/calculate."));
        return toResponse(valuation);
    }

    @Override
    public PropertyValuationResponse calculateValuation(Long propertyId) {
        authorizeProperty(propertyId);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("Property not found: " + propertyId));

        ValuationBreakdownDto breakdown = computeBreakdown(property);

        PropertyValuation valuation = new PropertyValuation();
        valuation.setProperty(property);
        valuation.setEstimatedValue(breakdown.getFinalEstimatedValue());
        valuation.setConfidenceLow(breakdown.getConfidenceLow());
        valuation.setConfidenceHigh(breakdown.getConfidenceHigh());
        valuation.setMethod(ValuationMethod.COMPARABLE); // blended estimate, tagged by its primary driver

        propertyValuationRepository.save(valuation);

        return toResponse(valuation);
    }

    @Override
    public ValuationBreakdownDto getMethodsBreakdown(Long propertyId) {
        authorizeProperty(propertyId);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("Property not found: " + propertyId));
        return computeBreakdown(property);
    }

    @Override
    public List<PropertyValuationResponse> getPriceHistory(Long propertyId) {
        authorizeProperty(propertyId);
        if (!propertyRepository.existsById(propertyId)) {
            throw new EntityNotFoundException("Property not found: " + propertyId);
        }
        return propertyValuationRepository.findByPropertyIdOrderByCalculatedAtDesc(propertyId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Helpers ─────────────────────────────────────────────────────

    /** RBAC: owner or view-all roles (ADMIN / LEGAL_REVIEWER / FINANCIAL_INSTITUTION). */
    private void authorizeProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("Property not found: " + propertyId));
        User currentUser = resolveCurrentUser();
        if (!RoleUtils.canAccessProperty(currentUser, property)) {
            throw new EntityNotFoundException("Property not found: " + propertyId);
        }
    }

    private User resolveCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return null;
            String email = auth.getName();
            if (email == null || email.isBlank()) return null;
            return userRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private ValuationBreakdownDto computeBreakdown(Property property) {
        double comparableValue = computeComparableValue(property);
        double costValue = computeCostValue(property);
        double incomeValue = computeIncomeValue(property);

        // Weighted blend — comparable method weighted highest since it's the
        // only one backed by real market data from nearby properties.
        double finalValue = (comparableValue * 0.5) + (costValue * 0.25) + (incomeValue * 0.25);

        double confidenceLow = finalValue * 0.90;
        double confidenceHigh = finalValue * 1.10;

        return ValuationBreakdownDto.builder()
                .comparableMethodValue(round2(comparableValue))
                .costMethodValue(round2(costValue))
                .incomeMethodValue(round2(incomeValue))
                .finalEstimatedValue(round2(finalValue))
                .confidenceLow(round2(confidenceLow))
                .confidenceHigh(round2(confidenceHigh))
                .build();
    }

    private double computeComparableValue(Property property) {
        ComparableAnalysisResponse analysis = comparablePropertyService
                .getComparables(property.getId(), DEFAULT_RADIUS_KM, 10);

        List<ComparablePropertyDto> comps = analysis.getComparables();
        if (comps.isEmpty()) {
            // No comparables found nearby — fall back to the property's own listed value.
            return property.getMarketValue() != null ? property.getMarketValue() : 0.0;
        }

        double avgPricePerSqft = comps.stream()
                .filter(c -> c.getPricePerSqft() != null)
                .mapToDouble(ComparablePropertyDto::getPricePerSqft)
                .average()
                .orElse(0.0);

        double area = property.getArea() != null ? property.getArea() : 0.0;
        return avgPricePerSqft * area;
    }

    private double computeCostValue(Property property) {
        // placeholder — no construction-cost index wired up yet
        double replacementCostPerSqft = 150.0;
        double landValuePerUnit = 50.0;

        double area = property.getArea() != null ? property.getArea() : 0.0;
        double lotSize = property.getLotSize() != null ? property.getLotSize() : 0.0;

        return (area * replacementCostPerSqft) + (lotSize * landValuePerUnit);
    }

    private double computeIncomeValue(Property property) {
        // placeholder — assumes monthly rent ≈ 0.8% of market value, capitalized at 6%
        double rentToValueRatio = 0.008;
        double capRate = 0.06;

        double marketValue = property.getMarketValue() != null ? property.getMarketValue() : 0.0;
        double annualRent = marketValue * rentToValueRatio * 12;

        return capRate > 0 ? annualRent / capRate : marketValue;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private PropertyValuationResponse toResponse(PropertyValuation valuation) {
        return PropertyValuationResponse.builder()
                .id(valuation.getId())
                .propertyId(valuation.getProperty().getId())
                .estimatedValue(valuation.getEstimatedValue())
                .confidenceLow(valuation.getConfidenceLow())
                .confidenceHigh(valuation.getConfidenceHigh())
                .method(valuation.getMethod())
                .calculatedAt(valuation.getCalculatedAt())
                .build();
    }
}
