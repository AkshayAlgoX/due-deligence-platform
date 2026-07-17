package com.realestate.duediligence.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PropertyRequest {

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Zip Code is required")
    private String zipCode;

    private String propertyType;

    @NotNull(message = "Area is required")
    private Double area;

    @NotNull(message = "Market value is required")
    private Double marketValue;

    // ── NEW OPTIONAL FIELDS ────────────────────────────────────────
    private Integer yearBuilt;
    private Double lotSize;
    private String zoning;
    private String imageUrl;
    private Boolean verified;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer stories;
    private String structureType;
    private String condition;
}