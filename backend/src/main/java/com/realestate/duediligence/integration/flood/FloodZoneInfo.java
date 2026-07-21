package com.realestate.duediligence.integration.flood;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloodZoneInfo {
    private String zoneClassification;    // LOW_RISK, MODERATE_RISK, HIGH_RISK, FLOOD_PRONE
    private String riskLevel;             // LOW, MEDIUM, HIGH
    private Boolean insuranceRequired;
    private String nearestWaterBody;
    private Double distanceToWaterBodyMeters;
    private LocalDate lastMajorFloodDate;
    private String dataAgency;            // e.g. "NDMA", "CWC"
}