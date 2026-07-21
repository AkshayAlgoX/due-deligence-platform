package com.realestate.duediligence.integration.environmental;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentalInfo {
    private Integer airQualityIndex;      // AQI value (CPCB scale)
    private String aqiCategory;           // GOOD, SATISFACTORY, MODERATE, POOR, VERY_POOR, SEVERE
    private String dominantPollutant;     // PM2.5, PM10, NO2, O3, SO2, CO
    private String nearestStation;        // CPCB monitoring station name
    private Double stationDistanceKm;
    private Instant measuredAt;

    // Non-AQI fields (mock for now)
    private String soilType;
    private Double greenCoveragePercent;
    private Integer noiseLevelDb;
    private Boolean nearIndustrialZone;
}