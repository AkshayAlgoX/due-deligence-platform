package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Single activity feed item on the dashboard.
 *
 * Derived from real property state — no separate audit log required.
 *   PROPERTY_ADDED     → newly created property
 *   PROPERTY_VERIFIED  → property that became verified
 *   PROPERTY_UPDATED   → property with updatedAt != createdAt
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityItemResponse {

    /** PROPERTY_ADDED | PROPERTY_VERIFIED | PROPERTY_UPDATED */
    private String type;

    /** Property involved */
    private Long propertyId;
    private String propertyAddress;
    private String propertyCity;

    /** When the activity happened */
    private LocalDateTime timestamp;

    /** Who did it (full name if available, else email) */
    private String actorName;
}