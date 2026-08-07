package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparablePropertyDto {

    private Long id;
    private Long propertyId;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private Double marketValue;
    private Double area;
    private Integer bedrooms;
    private Integer bathrooms;
    private Double similarityScore;
    private String similarityLevel;
    private Double distanceKm;
    private Double pricePerSqft;
}
