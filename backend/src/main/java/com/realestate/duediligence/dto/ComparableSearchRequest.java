package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComparableSearchRequest {

    private Double radiusKm;

    private Double minPrice;

    private Double maxPrice;

    private Integer minBedrooms;

    private Integer maxBedrooms;

    private String propertyType;

    private Integer limit;
}
