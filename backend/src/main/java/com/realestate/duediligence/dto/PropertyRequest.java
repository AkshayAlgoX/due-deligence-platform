package com.realestate.duediligence.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * PropertyRequest — with validation for the 2 required fields.
 *
 * Progressive disclosure: only address + city required.
 * Everything else is optional (property can be created and completed later).
 * BUT if optional fields are provided, they must be valid.
 */
@Data
public class PropertyRequest {

    // ── Required fields ──────────────────────────────────────────────
    @NotBlank(message = "Address is required")
    @Size(min = 6, max = 255, message = "Address must be between 6 and 255 characters")
    private String address;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 100, message = "City must be between 2 and 100 characters")
    private String city;

    // ── Optional fields (validated only if provided) ─────────────────
    @Size(max = 100, message = "State cannot exceed 100 characters")
    private String state;

    @Pattern(
        regexp = "^\\d{5,6}$|^$",  // 5-6 digits OR empty
        message = "ZIP code must be 5 or 6 digits"
    )
    private String zipCode;

    @Size(max = 50, message = "Property type cannot exceed 50 characters")
    private String propertyType;

    @Positive(message = "Area must be positive")
    private Double area;

    @Positive(message = "Market value must be positive")
    private Double marketValue;

    // ── Optional extras (no strict validation) ───────────────────────
    private Integer yearBuilt;
    private Double lotSize;
    private String zoning;
    private String imageUrl;
    private Boolean verified;  // ignored by backend, kept for compat
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer stories;
    private String structureType;
    private String condition;
}