package com.realestate.duediligence.dto;

import java.util.Map;

import lombok.Builder;
import lombok.Data;

/**
 * One actionable recommendation derived from real property data.
 *
 * title, description, and actionLabel are now i18n KEYS.
 * The frontend calls t(titleKey, titleParams) to render the translated string.
 * titleParams / descriptionParams carry the interpolation variables.
 */
@Data
@Builder
public class RecommendationResponse {

    /**
     * Stable machine identifier for this recommendation type.
     * e.g. "INCOMPLETE_DATA", "MISSING_PHOTO", "PENDING_VERIFICATION"
     * Used by frontend for dismiss logic (stored in localStorage).
     */
    private String type;

    /** HIGH | MEDIUM | POSITIVE | LOW */
    private String severity;

    /** i18n key for the title, e.g. "recommendations.items.incompleteData.title" */
    private String titleKey;

    /** Interpolation params for titleKey, e.g. { "fieldCount": 3, "address": "..." } */
    private Map<String, Object> titleParams;

    /** i18n key for the description */
    private String descriptionKey;

    /** Interpolation params for descriptionKey */
    private Map<String, Object> descriptionParams;

    /** i18n key for the action button label */
    private String actionLabelKey;

    /**
     * Optional — property this recommendation relates to.
     * Used by frontend to deep-link to the specific property.
     */
    private Long propertyId;

    /**
     * e.g. "/dashboard/property-search" or null if no direct action.
     */
    private String actionUrl;
}