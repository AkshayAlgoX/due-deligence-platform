package com.realestate.duediligence.dto;

import lombok.Data;

@Data
public class PropertyRequest {

    // required (minimum viable property)
    private String address;
    private String city;

    // optional (required only for verification)
    private String state;
    private String zipCode;
    private String propertyType;

    // optional
    private Double area;
    private Double marketValue;

    // optional extras
    private Integer yearBuilt;
    private Double lotSize;
    private String zoning;
    private String imageUrl;
    private Boolean verified; // ignored by backend verification engine (kept for backward compatibility)
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer stories;
    private String structureType;
    private String condition;
}