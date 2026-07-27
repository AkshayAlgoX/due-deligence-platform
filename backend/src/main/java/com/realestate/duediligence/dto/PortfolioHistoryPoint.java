package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One data point on the portfolio trend chart.
 * date is ISO string (yyyy-MM-dd) — safe for JSON + Recharts.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioHistoryPoint {
    private String date;          // "2025-07-01"
    private Double totalValue;    // sum of marketValue
    private Integer propertyCount;
    private Integer verifiedCount;
    private Integer totalCities;
}