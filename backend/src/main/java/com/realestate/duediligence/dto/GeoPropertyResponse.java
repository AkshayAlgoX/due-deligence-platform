package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight geo point for map markers.
 * Only sent for properties that have lat + lon set.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeoPropertyResponse {
    private Long id;
    private String address;
    private String city;
    private String state;
    private Double latitude;
    private Double longitude;
    private Double marketValue;
    private Boolean verified;
    private String propertyType;
}