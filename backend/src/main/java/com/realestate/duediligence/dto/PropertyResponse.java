package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertyResponse {

    private Long id;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String propertyType;
    private Double area;
    private Double marketValue;

    // ── NEW FIELDS ─────────────────────────────────────────────────
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