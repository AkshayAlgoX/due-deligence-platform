package com.realestate.duediligence.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Portfolio-level analytics for the dashboard hero strip.
 *
 * All values computed from real DB rows. No dummy data.
 * If portfolio is empty, all numeric fields return 0 and lists return empty.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioInsightsResponse {

    /** Sum of marketValue across all properties (nulls treated as 0). */
    private double totalPortfolioValue;

    /** Average marketValue across properties with a non-null value. */
    private double averagePropertyValue;

    /** Property with the highest marketValue. Null if no valued properties. */
    private HighlightProperty highestValueProperty;

    /** Count + total value grouped by propertyType. */
    private List<TypeDistribution> distributionByType;

    /** Count grouped by city. */
    private List<CityDistribution> distributionByCity;

    /** City with the most properties. Used for live AQI widget. */
    private String userTopCity;

    /** Total unique cities covered. */
    private int totalCitiesCovered;

    // ── Nested types ────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HighlightProperty {
        private Long id;
        private String address;
        private String city;
        private double marketValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypeDistribution {
        private String propertyType;
        private long count;
        private double totalValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CityDistribution {
        private String city;
        private long count;
    }
}