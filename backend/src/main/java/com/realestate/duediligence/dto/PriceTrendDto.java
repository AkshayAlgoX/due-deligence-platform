package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceTrendDto {

    /** Format: "yyyy-MM", e.g. "2026-01" */
    private String month;
    private Double avgPricePerSqft;
    private Double medianPrice;
    private Integer sampleSize;
}
