package com.realestate.duediligence.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparableAnalysisResponse {

    private Long id;
    private Long propertyId;
    private Double radiusKm;
    private LocalDateTime createdAt;
    private List<ComparablePropertyDto> comparables;
}
