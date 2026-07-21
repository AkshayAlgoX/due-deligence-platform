package com.realestate.duediligence.integration.zoning;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoningInfo {
    private String zoneCode;              // R1, R2, C1, I2 etc.
    private String zoneCategory;          // RESIDENTIAL, COMMERCIAL, INDUSTRIAL, MIXED_USE
    private Double maxFAR;                // Floor Area Ratio
    private Double maxGroundCoverage;     // %
    private Double maxHeightMeters;
    private List<String> allowedUses;
    private List<String> restrictedUses;
    private String masterPlanReference;   // e.g. "Bengaluru RMP 2031"
}