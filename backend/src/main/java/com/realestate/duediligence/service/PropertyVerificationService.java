package com.realestate.duediligence.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.entity.Property;

/**
 * PropertyVerificationService — data quality rules engine.
 *
 * A property is "verified" only when ALL data-quality checks pass.
 * This makes the verified badge meaningful instead of a fake label.
 *
 * Rules (all must pass for verification):
 *   1. Address present and length > 5
 *   2. City present
 *   3. State present
 *   4. ZIP code present
 *   5. Property type present
 *   6. Market value > 0
 *   7. Area > 0
 *
 * Called automatically on every property create/update in PropertyServiceImpl.
 */
@Service
public class PropertyVerificationService {

    /**
     * Run all verification rules. Returns true if property passes ALL checks.
     * Side effect: sets property.verified to the result.
     */
    public boolean verify(Property property) {
        List<String> failures = findMissingFields(property);
        boolean passed = failures.isEmpty();
        property.setVerified(passed);
        return passed;
    }

    /**
     * Returns a list of human-readable field names that fail verification.
     * Empty list = property is fully verified.
     * Useful for showing users WHY their property is pending.
     */
    public List<String> findMissingFields(Property property) {
        List<String> missing = new ArrayList<>();

        if (property.getAddress() == null || property.getAddress().trim().length() <= 5) {
            missing.add("Complete Address");
        }
        if (isBlank(property.getCity())) {
            missing.add("City");
        }
        if (isBlank(property.getState())) {
            missing.add("State");
        }
        if (isBlank(property.getZipCode())) {
            missing.add("ZIP Code");
        }
        if (isBlank(property.getPropertyType())) {
            missing.add("Property Type");
        }
        if (property.getMarketValue() == null || property.getMarketValue() <= 0) {
            missing.add("Market Value");
        }
        if (property.getArea() == null || property.getArea() <= 0) {
            missing.add("Area (sqft)");
        }

        return missing;
    }

    /**
     * Total number of verification checks. Used to compute completion %.
     */
    public int getTotalChecks() {
        return 7;
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}