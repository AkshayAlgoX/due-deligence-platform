package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValuationBreakdownDto {

    private Double comparableMethodValue;
    private Double costMethodValue;
    private Double incomeMethodValue;
    private Double finalEstimatedValue;
    private Double confidenceLow;
    private Double confidenceHigh;
}
