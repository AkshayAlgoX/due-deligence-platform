package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One actionable recommendation derived from real property data.
 * No ML — pure rule-based scanning of DB state.
 *
 * severity: HIGH | MEDIUM | LOW | POSITIVE
 * type: unique string key so frontend can deduplicate / dismiss by type
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {

    /** Unique key — used for localStorage dismiss tracking. */
    private String type;

    /** HIGH | MEDIUM | LOW | POSITIVE */
    private String severity;

    /** Short headline — sentence case, no corporate speak. */
    private String title;

    /** One sentence explaining what to do and why. */
    private String description;

    /**
     * Optional — property this recommendation relates to.
     * Null for portfolio-level recommendations.
     */
    private Long propertyId;

    /**
     * Frontend route to navigate to when user clicks the action button.
     * e.g. "/dashboard/property-search" or null if no direct action.
     */
    private String actionUrl;

    /** Button label — verb. e.g. "View property", "Add details". */
    private String actionLabel;
}