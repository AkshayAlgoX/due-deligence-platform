package com.realestate.duediligence.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAnalyticsResponse {

    private List<AvgValueByType> avgValueByType;
    private List<PricePerSqftByCity> pricePerSqftByCity;
    private List<VerificationRateByCity> verificationRateByCity;
    private PortfolioConcentration portfolioConcentration;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvgValueByType {
        private String type;
        private double avgValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricePerSqftByCity {
        private String city;
        private double pricePerSqft;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerificationRateByCity {
        private String city;
        private double rate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PortfolioConcentration {
        private String topCity;
        private long propertyCount;
        private int pct;
    }
}