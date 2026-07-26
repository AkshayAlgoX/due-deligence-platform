// backend/src/main/java/com/realestate/duediligence/service/impl/RiskScoringServiceImpl.java
package com.realestate.duediligence.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.realestate.duediligence.aggregation.AggregatedPropertyResponse;
import com.realestate.duediligence.aggregation.PropertyAggregationService;
import com.realestate.duediligence.dto.RiskScoreResponse;
import com.realestate.duediligence.integration.common.IntegrationResponse;
import com.realestate.duediligence.integration.common.IntegrationStatus;
import com.realestate.duediligence.integration.environmental.EnvironmentalInfo;
import com.realestate.duediligence.integration.flood.FloodZoneInfo;
import com.realestate.duediligence.service.RiskScoringService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Rule-based risk engine. Transparent, auditable, no ML.
 *
 * Weights:
 *   Financial    30%
 *   Legal        30%
 *   Environmental 25%
 *   Structural   15%
 *
 * Reads from PropertyAggregationService which is already @Cacheable(1hr),
 * so repeated risk calls are essentially free.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RiskScoringServiceImpl implements RiskScoringService {

    private final PropertyAggregationService aggregationService;

        @Override
    @Cacheable(value = "propertyRisk", key = "#propertyId + '_' + T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    public RiskScoreResponse computeRisk(Long propertyId) {
        log.debug("Computing risk for property {}", propertyId);

        AggregatedPropertyResponse agg = aggregationService.aggregate(propertyId);
        var property = agg.getProperty();

        List<String> flags = new ArrayList<>();
        boolean dataIncomplete = false;

        // ── FINANCIAL (0–100) ─────────────────────────────────────────────
        int financial = 0;

        if (property.getMarketValue() == null) {
            financial += 40;
            flags.add("No market value set");
        }
        if (property.getArea() == null) {
            financial += 20;
            flags.add("No area recorded — price per sqft cannot be calculated");
        }
        if (property.getYearBuilt() == null) {
            financial += 15;
            flags.add("Year built unknown — affects depreciation estimate");
        }
        if (property.getLotSize() == null) {
            financial += 10;
            flags.add("Lot size missing");
        }
        // Market value set but area missing → can't compute price/sqft
        if (property.getMarketValue() != null && property.getArea() == null) {
            financial += 15;
            // flag already added above
        }
        financial = cap(financial);

        // ── LEGAL (0–100) ─────────────────────────────────────────────────
        int legal = 0;

        if (Boolean.FALSE.equals(property.getVerified())) {
            legal += 30;
            flags.add("Property not verified — data quality checks pending");
        }

        IntegrationStatus ownershipStatus = statusOf(agg.getOwnership());
        if (ownershipStatus == IntegrationStatus.UNAVAILABLE
                || ownershipStatus == IntegrationStatus.ERROR
                || ownershipStatus == IntegrationStatus.TIMEOUT) {
            legal += 20;
            flags.add("Ownership data unavailable");
            dataIncomplete = true;
        } else if (ownershipStatus == IntegrationStatus.MOCK) {
            legal += 10;
            dataIncomplete = true;
        }

        IntegrationStatus zoningStatus = statusOf(agg.getZoning());
        if (zoningStatus == IntegrationStatus.UNAVAILABLE
                || zoningStatus == IntegrationStatus.ERROR
                || zoningStatus == IntegrationStatus.TIMEOUT) {
            legal += 15;
            flags.add("Zoning classification could not be verified");
            dataIncomplete = true;
        } else if (zoningStatus == IntegrationStatus.MOCK) {
            legal += 8;
            dataIncomplete = true;
        }

        IntegrationStatus permitStatus = statusOf(agg.getPermits());
        if (permitStatus == IntegrationStatus.UNAVAILABLE
                || permitStatus == IntegrationStatus.ERROR
                || permitStatus == IntegrationStatus.TIMEOUT) {
            legal += 10;
            flags.add("Permit records unavailable");
            dataIncomplete = true;
        }

        legal = cap(legal);

        // ── ENVIRONMENTAL (0–100) ─────────────────────────────────────────
        int environmental = 0;

        IntegrationResponse<EnvironmentalInfo> envResp = agg.getEnvironmental();
        if (envResp != null && envResp.getData() != null) {
            EnvironmentalInfo env = envResp.getData();
            Integer aqi = env.getAirQualityIndex();
            if (aqi != null) {
                if (aqi > 300) {
                    environmental += 50;
                    flags.add("AQI " + aqi + " — severe air quality (CPCB: Severe)");
                } else if (aqi > 200) {
                    environmental += 40;
                    flags.add("AQI " + aqi + " — very poor air quality");
                } else if (aqi > 150) {
                    environmental += 30;
                    flags.add("AQI " + aqi + " — poor air quality");
                } else if (aqi > 100) {
                    environmental += 15;
                    flags.add("AQI " + aqi + " — moderate air quality");
                }
                // AQI <= 100: no environmental penalty from air quality
            }

            if (Boolean.TRUE.equals(env.getNearIndustrialZone())) {
                environmental += 20;
                flags.add("Property near industrial zone");
            }
        } else {
            IntegrationStatus envStatus = statusOf(envResp);
            if (envStatus == IntegrationStatus.UNAVAILABLE
                    || envStatus == IntegrationStatus.ERROR
                    || envStatus == IntegrationStatus.TIMEOUT) {
                environmental += 10;
                dataIncomplete = true;
            } else if (envStatus == IntegrationStatus.MOCK) {
                environmental += 5;
                dataIncomplete = true;
            }
        }

        // Flood zone assessment
        IntegrationResponse<FloodZoneInfo> floodResp = agg.getFloodZone();
        if (floodResp != null && floodResp.getData() != null) {
            FloodZoneInfo flood = floodResp.getData();
            String riskLevel = flood.getRiskLevel();
            if ("HIGH".equalsIgnoreCase(riskLevel)) {
                environmental += 30;
                flags.add("High flood risk zone — " + flood.getZoneClassification());
            } else if ("MEDIUM".equalsIgnoreCase(riskLevel)) {
                environmental += 15;
                flags.add("Moderate flood risk zone");
            }
        } else {
            IntegrationStatus floodStatus = statusOf(floodResp);
            if (floodStatus == IntegrationStatus.UNAVAILABLE
                    || floodStatus == IntegrationStatus.ERROR) {
                environmental += 8;
                dataIncomplete = true;
            }
        }

        environmental = cap(environmental);

        // ── STRUCTURAL (0–100) ────────────────────────────────────────────
        int structural = 0;

        if (property.getCondition() == null || property.getCondition().isBlank()) {
            structural += 20;
            flags.add("Property condition not recorded");
        } else {
            String cond = property.getCondition().toLowerCase();
            if (cond.contains("poor") || cond.contains("bad") || cond.contains("damaged")) {
                structural += 35;
                flags.add("Property condition reported as: " + property.getCondition());
            } else if (cond.contains("fair") || cond.contains("average")) {
                structural += 15;
            }
        }

        if (property.getYearBuilt() != null && property.getYearBuilt() < 1980) {
            structural += 15;
            flags.add("Built before 1980 — structural review recommended");
        }

        if (property.getBedrooms() == null && property.getBathrooms() == null) {
            structural += 10;
            flags.add("Room configuration not recorded");
        }

        if (property.getStories() == null) {
            structural += 5;
        }

        structural = cap(structural);

        // ── WEIGHTED OVERALL (0–100) ──────────────────────────────────────
        // Financial 30%, Legal 30%, Environmental 25%, Structural 15%
        double overall = (financial * 0.30)
                + (legal * 0.30)
                + (environmental * 0.25)
                + (structural * 0.15);

        int overallScore = cap((int) Math.round(overall));

        String label;
        if (overallScore <= 33) {
            label = "LOW";
        } else if (overallScore <= 66) {
            label = "MEDIUM";
        } else {
            label = "HIGH";
        }

        log.debug("Risk for property {}: {} ({}) — F:{} L:{} E:{} S:{}",
                propertyId, overallScore, label,
                financial, legal, environmental, structural);

        return RiskScoreResponse.builder()
                .propertyId(propertyId)
                .overallScore(overallScore)
                .riskLabel(label)
                .financialScore(financial)
                .legalScore(legal)
                .environmentalScore(environmental)
                .structuralScore(structural)
                .riskFlags(flags)
                .dataIncomplete(dataIncomplete)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private int cap(int value) {
        return Math.min(100, Math.max(0, value));
    }

    private IntegrationStatus statusOf(IntegrationResponse<?> resp) {
        if (resp == null) return IntegrationStatus.UNAVAILABLE;
        return resp.getStatus() != null ? resp.getStatus() : IntegrationStatus.UNAVAILABLE;
    }
}