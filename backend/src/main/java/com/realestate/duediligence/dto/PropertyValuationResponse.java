package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import com.realestate.duediligence.enums.ValuationMethod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyValuationResponse {

    private Long id;
    private Long propertyId;
    private Double estimatedValue;
    private Double confidenceLow;
    private Double confidenceHigh;
    private ValuationMethod method;
    private LocalDateTime calculatedAt;
}
