// backend/src/main/java/com/realestate/duediligence/service/RiskScoringEngine.java
package com.realestate.duediligence.service;

import java.time.Instant;
import java.time.Year;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.realestate.duediligence.aggregation.AggregatedPropertyResponse;
import com.realestate.duediligence.aggregation.PropertyAggregationService;
import com.realestate.duediligence.config.RiskScoringConfig;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.dto.RiskFactorDto;
import com.realestate.duediligence.entity.RiskAssessment;
import com.realestate.duediligence.entity.RiskFactor;
import com.realestate.duediligence.enums.RiskCategory;
import com.realestate.duediligence.enums.RiskLevel;
import com.realestate.duediligence.integration.common.IntegrationResponse;
import com.realestate.duediligence.integration.common.IntegrationStatus;
import com.realestate.duediligence.integration.environmental.EnvironmentalInfo;
import com.realestate.duediligence.integration.flood.FloodZoneInfo;
import com.realestate.duediligence.integration.ownership.OwnershipRecord;
import com.realestate.duediligence.integration.permit.PermitRecord;
import com.realestate.duediligence.integration.tax.TaxRecord;
import com.realestate.duediligence.integration.zoning.ZoningInfo;

import lombok.RequiredArgsConstructor;

/**
 * Risk Scoring Engine — THE BRAIN of Milestone 3.
 *
 * Analyzes AggregatedPropertyResponse from PropertyAggregationService and
 * produces a complete RiskAssessment entity ready to persist, plus a
 * RiskBreakdownDto for immediate API response.
 *
 * ── Scoring Philosophy ───────────────────────────────────────────────────
 * Score range 0–100 per category (higher = more risk):
 *   0–25   → LOW
 *   26–50  → MEDIUM
 *   51–75  → HIGH
 *   76–100 → CRITICAL
 *
 * Overall = FLOOD(25%) + LEGAL(20%) + TAX(15%) + ZONING(15%) + ENV(15%) + MARKET(10%)
 *
 * Unavailable providers receive uncertainty penalty (default 15pts) — honest scoring.
 */
@Service
@RequiredArgsConstructor
public class RiskScoringEngine {

    private static final Logger log = LoggerFactory.getLogger(RiskScoringEngine.class);

    private final PropertyAggregationService aggregationService;
    private final RiskScoringConfig config;

    // ── Public entry point ────────────────────────────────────────

    public EngineResult compute(Long propertyId) {
        log.info("RiskScoringEngine: computing risk for property {}", propertyId);

        AggregatedPropertyResponse agg = aggregationService.aggregate(propertyId);

        CategoryResult flood         = scoreFlood(agg.getFloodZone());
        CategoryResult legal         = scoreLegal(agg.getOwnership(), agg.getPermits());
        CategoryResult tax           = scoreTax(agg.getTaxHistory());
        CategoryResult zoning        = scoreZoning(agg.getZoning(), agg);
        CategoryResult environmental = scoreEnvironmental(agg.getEnvironmental());
        CategoryResult market        = scoreMarket(agg);

        double overall = clamp(weightedScore(flood, legal, tax, zoning, environmental, market));
        RiskLevel overallLevel = RiskLevel.fromScore(overall);

        int unavailable = countUnavailable(
                agg.getFloodZone(), agg.getOwnership(), agg.getTaxHistory(),
                agg.getZoning(), agg.getEnvironmental(), agg.getPermits());
        boolean dataIncomplete = unavailable > 0;

        String summary = buildSummary(overall, overallLevel,
                flood, legal, tax, zoning, environmental, market, dataIncomplete);

        List<RiskFactor> factorEntities = buildFactorEntities(
                flood, legal, tax, zoning, environmental, market);

        RiskAssessment assessment = RiskAssessment.builder()
                .overallScore(overall)
                .overallLevel(overallLevel)
                .floodScore(flood.score())
                .legalScore(legal.score())
                .taxScore(tax.score())
                .zoningScore(zoning.score())
                .environmentalScore(environmental.score())
                .marketScore(market.score())
                .summary(summary)
                .isLatest(true)
                .build();

        RiskBreakdownDto breakdown = buildBreakdownDto(
                propertyId, overall, overallLevel,
                flood, legal, tax, zoning, environmental, market,
                dataIncomplete, unavailable);

        log.info("RiskScoringEngine: property {} scored {:.1f} ({})",
                propertyId, overall, overallLevel);

        return new EngineResult(assessment, factorEntities, breakdown,
                overall, overallLevel, summary, dataIncomplete);
    }

    // ── Result container ──────────────────────────────────────────

    public record EngineResult(
            RiskAssessment assessment,
            List<RiskFactor> factorEntities,
            RiskBreakdownDto breakdown,
            double overallScore,
            RiskLevel overallLevel,
            String summary,
            boolean dataIncomplete
    ) {}

    // ══════════════════════════════════════════════════════════════
    // CATEGORY SCORERS
    // ══════════════════════════════════════════════════════════════

    // ── 1. FLOOD (weight 25%) ─────────────────────────────────────

    private CategoryResult scoreFlood(IntegrationResponse<FloodZoneInfo> floodResp) {
        RiskCategory cat = RiskCategory.FLOOD;

        if (!isDataUsable(floodResp)) {
            return unavailableResult(cat,
                    floodResp != null ? floodResp.getStatus().name() : "UNAVAILABLE",
                    "Flood zone data could not be retrieved from NDMA/CWC.",
                    "Manually check NDMA flood hazard maps at ndma.gov.in before purchase.");
        }

        FloodZoneInfo info = floodResp.getData();
        if (info == null) {
            return unavailableResult(cat, "NO_DATA",
                    "No flood zone record found for this property location.",
                    "Contact local municipal office or NDMA to determine flood zone classification.");
        }

        double score = 0.0;
        StringBuilder explanation = new StringBuilder();
        StringBuilder recommendation = new StringBuilder();

        String zone = info.getZoneClassification();
        if (zone != null) {
            switch (zone.toUpperCase()) {
                case "FLOOD_PRONE" -> {
                    score += config.getFlood().getFloodProneScore();
                    explanation.append("Property is in a FLOOD_PRONE zone — highest risk classification. ");
                }
                case "HIGH_RISK" -> {
                    score += config.getFlood().getHighRiskScore();
                    explanation.append("Property is in a HIGH_RISK flood zone. ");
                }
                case "MODERATE_RISK" -> {
                    score += config.getFlood().getModerateRiskScore();
                    explanation.append("Property is in a MODERATE_RISK flood zone. ");
                }
                case "LOW_RISK" -> {
                    score += config.getFlood().getLowRiskScore();
                    explanation.append("Property is in a LOW_RISK flood zone. ");
                }
                default -> {
                    score += config.getUncertaintyPenalty();
                    explanation.append("Unknown flood zone classification '").append(zone).append("'. ");
                }
            }
        }

        if (Boolean.TRUE.equals(info.getInsuranceRequired())) {
            score += config.getFlood().getInsuranceRequiredBonus();
            explanation.append("Flood insurance is mandatory for this zone. ");
            recommendation.append("Obtain NDMA-approved flood insurance before purchase. ");
        }

        if (info.getDistanceToWaterBodyMeters() != null) {
            double dist = info.getDistanceToWaterBodyMeters();
            if (dist < config.getFlood().getWaterBodyProximityThresholdMeters()) {
                score += config.getFlood().getWaterBodyProximityBonus();
                explanation.append(String.format(
                        "Property is %.0fm from nearest water body (%s) — within high-proximity threshold. ",
                        dist,
                        info.getNearestWaterBody() != null ? info.getNearestWaterBody() : "unnamed"));
            } else {
                explanation.append(String.format(
                        "Nearest water body (%s) is %.0fm away — outside high-proximity threshold. ",
                        info.getNearestWaterBody() != null ? info.getNearestWaterBody() : "unnamed",
                        dist));
            }
        }

        if (info.getLastMajorFloodDate() != null) {
            int yearsAgo = Year.now().getValue() - info.getLastMajorFloodDate().getYear();
            if (yearsAgo <= 5) {
                score += 12.0;
                explanation.append(String.format(
                        "Major flood event recorded %d year(s) ago (%s) — recent history increases risk. ",
                        yearsAgo, info.getLastMajorFloodDate()));
                recommendation.append("Review flood damage history with local NDMA office. ");
            } else if (yearsAgo <= 10) {
                score += 6.0;
                explanation.append(String.format(
                        "Major flood event recorded %d years ago (%s). ",
                        yearsAgo, info.getLastMajorFloodDate()));
            }
        }

        if (recommendation.isEmpty()) {
            if (score > 50) {
                recommendation.append("Conduct independent flood risk survey. Check NDMA hazard maps. ");
                recommendation.append("Negotiate flood mitigation clauses in purchase agreement.");
            } else if (score > 25) {
                recommendation.append("Review NDMA flood zone maps. Consider flood insurance as a precaution.");
            } else {
                recommendation.append("Property appears low-risk for flooding. Standard insurance is sufficient.");
            }
        } else if (score > 50) {
            recommendation.append("Conduct independent flood risk survey. Negotiate mitigation clauses.");
        }

        score = clamp(score);
        String dataSource = floodResp.getDataSource() != null
                ? floodResp.getDataSource() : floodResp.getStatus().name();

        return new CategoryResult(cat, score, RiskLevel.fromScore(score),
                config.getWeights().getFlood(),
                explanation.toString().trim(), recommendation.toString().trim(),
                dataSource, false);
    }

    // ── 2. LEGAL (weight 20%) ─────────────────────────────────────

    private CategoryResult scoreLegal(
            IntegrationResponse<OwnershipRecord> ownershipResp,
            IntegrationResponse<List<PermitRecord>> permitsResp) {

        RiskCategory cat = RiskCategory.LEGAL;

        if (!isDataUsable(ownershipResp)) {
            return unavailableResult(cat,
                    ownershipResp != null ? ownershipResp.getStatus().name() : "UNAVAILABLE",
                    "Ownership and registration data could not be retrieved from land registry.",
                    "Request certified copies of title deed from Sub-Registrar office. " +
                    "Engage a lawyer to verify ownership chain before purchase.");
        }

        OwnershipRecord record = ownershipResp.getData();
        if (record == null) {
            return unavailableResult(cat, "NO_DATA",
                    "No ownership record found in land registry for this property.",
                    "This is a serious red flag. Verify property title with local Sub-Registrar office " +
                    "before any transaction. Do not proceed without title verification.");
        }

        double score = 0.0;
        StringBuilder explanation = new StringBuilder();
        StringBuilder recommendation = new StringBuilder();

        String ownershipType = record.getOwnershipType();
        if (ownershipType != null) {
            switch (ownershipType.toUpperCase()) {
                case "FREEHOLD" -> {
                    explanation.append("Property is FREEHOLD — buyer acquires full title. Lowest legal risk. ");
                }
                case "LEASEHOLD" -> {
                    score += 20.0;
                    explanation.append("Property is LEASEHOLD — ownership is time-limited. ");
                    recommendation.append("Verify lease term remaining and renewal conditions. ");
                }
                case "COOPERATIVE_SOCIETY" -> {
                    score += 15.0;
                    explanation.append("Property is held through a Cooperative Society — " +
                            "transfer requires society approval. ");
                    recommendation.append("Obtain No Objection Certificate (NOC) from the cooperative society. ");
                }
                case "POWER_OF_ATTORNEY" -> {
                    score += 35.0;
                    explanation.append("Property is held under Power of Attorney — " +
                            "HIGH legal risk. POA transactions are legally complex in India " +
                            "and prone to disputes. ");
                    recommendation.append("Engage a qualified property lawyer immediately. " +
                            "Verify the POA is registered, current, and not revoked. " +
                            "Supreme Court ruling (2011) restricts POA-based transfers. ");
                }
                default -> {
                    score += 10.0;
                    explanation.append("Ownership type '").append(ownershipType)
                            .append("' is non-standard — verify legal implications. ");
                }
            }
        } else {
            score += config.getUncertaintyPenalty();
            explanation.append("Ownership type not recorded in registry. ");
            recommendation.append("Obtain certified copy of title deed to confirm ownership structure. ");
        }

        if (record.getRegistrationDate() != null) {
            int yearsOld = Year.now().getValue() - record.getRegistrationDate().getYear();
            if (yearsOld > 20) {
                score += 8.0;
                explanation.append(String.format(
                        "Registration is %d years old — verify no encumbrances exist since last transfer. ",
                        yearsOld));
                recommendation.append("Obtain 30-year encumbrance certificate from Sub-Registrar. ");
            }
        } else {
            score += 10.0;
            explanation.append("Registration date not available — unable to verify currency of title. ");
        }

        List<OwnershipRecord.PreviousOwner> history = record.getOwnershipHistory();
        if (history != null && !history.isEmpty()) {
            long disputedTransfers = history.stream()
                    .filter(o -> o.getTransferReason() != null &&
                            (o.getTransferReason().equalsIgnoreCase("PARTITION") ||
                             o.getTransferReason().equalsIgnoreCase("GIFT")))
                    .count();
            if (disputedTransfers > 0) {
                score += disputedTransfers * 8.0;
                explanation.append(String.format(
                        "%d transfer(s) via PARTITION/GIFT in ownership history — " +
                        "these are legally complex and may carry hidden disputes. ",
                        disputedTransfers));
                recommendation.append("Review all PARTITION/GIFT transfer documents for completeness. ");
            }
            if (history.size() >= 4) {
                score += 5.0;
                explanation.append(String.format(
                        "Property has had %d previous owners — high turnover warrants legal scrutiny. ",
                        history.size()));
            }
        }

        if (isDataUsable(permitsResp) && permitsResp.getData() != null) {
            List<PermitRecord> permits = permitsResp.getData();
            long rejectedPermits = permits.stream()
                    .filter(p -> "REJECTED".equalsIgnoreCase(p.getStatus()))
                    .count();
            long expiredPermits = permits.stream()
                    .filter(p -> "EXPIRED".equalsIgnoreCase(p.getStatus()))
                    .count();

            if (rejectedPermits > 0) {
                score += rejectedPermits * 15.0;
                explanation.append(String.format(
                        "%d building permit(s) REJECTED — may indicate unauthorized construction. ",
                        rejectedPermits));
                recommendation.append("Investigate rejected permit(s). " +
                        "Unauthorized construction may require demolition or regularization. ");
            }
            if (expiredPermits > 0) {
                score += expiredPermits * 8.0;
                explanation.append(String.format(
                        "%d building permit(s) EXPIRED — renewal may be required. ",
                        expiredPermits));
                recommendation.append("Ensure all permits are renewed before purchase completion. ");
            }
            if (permits.stream().anyMatch(p -> "PENDING".equalsIgnoreCase(p.getStatus()))) {
                score += 5.0;
                explanation.append("Building permit(s) currently PENDING — approval not yet confirmed. ");
            }
        }

        if (recommendation.isEmpty()) {
            recommendation.append("Obtain encumbrance certificate and verify title chain. " +
                    "Confirm no pending litigations via court records.");
        }

        score = clamp(score);
        String dataSource = ownershipResp.getDataSource() != null
                ? ownershipResp.getDataSource() : ownershipResp.getStatus().name();

        return new CategoryResult(cat, score, RiskLevel.fromScore(score),
                config.getWeights().getLegal(),
                explanation.toString().trim(), recommendation.toString().trim(),
                dataSource, false);
    }

    // ── 3. TAX (weight 15%) ───────────────────────────────────────

    private CategoryResult scoreTax(IntegrationResponse<List<TaxRecord>> taxResp) {
        RiskCategory cat = RiskCategory.TAX;

        if (!isDataUsable(taxResp)) {
            return unavailableResult(cat,
                    taxResp != null ? taxResp.getStatus().name() : "UNAVAILABLE",
                    "Property tax records could not be retrieved from municipal records.",
                    "Request tax clearance certificate from the local municipal body " +
                    "(BBMP/MCGM/MCD) before purchase. Verify no outstanding dues.");
        }

        List<TaxRecord> records = taxResp.getData();
        if (records == null || records.isEmpty()) {
            return new CategoryResult(
                    cat, 5.0, RiskLevel.LOW, config.getWeights().getTax(),
                    "No property tax records found. Property may be newly assessed or unregistered.",
                    "Request tax assessment history from local municipal body to confirm status.",
                    taxResp.getDataSource(), false);
        }

        double score = 0.0;
        StringBuilder explanation = new StringBuilder();
        StringBuilder recommendation = new StringBuilder();

        long overdueCount = records.stream()
                .filter(r -> "OVERDUE".equalsIgnoreCase(r.getStatus()))
                .count();
        long pendingCount = records.stream()
                .filter(r -> "PENDING".equalsIgnoreCase(r.getStatus()))
                .count();
        long paidCount = records.stream()
                .filter(r -> "PAID".equalsIgnoreCase(r.getStatus()))
                .count();

        if (overdueCount > 0) {
            score += overdueCount * config.getTax().getOverdueRecordScore();
            explanation.append(String.format(
                    "%d OVERDUE tax record(s) found — outstanding dues may become a lien on the property. ",
                    overdueCount));
            recommendation.append(String.format(
                    "Demand tax clearance certificate covering all %d overdue year(s). " +
                    "Ensure seller clears all dues before registration. ",
                    overdueCount));
        }

        if (pendingCount > 0) {
            score += pendingCount * config.getTax().getPendingRecordScore();
            explanation.append(String.format(
                    "%d PENDING tax record(s) found — payment not yet confirmed. ",
                    pendingCount));
            recommendation.append("Verify pending payments are cleared before closing. ");
        }

        if (paidCount > 0 && overdueCount == 0 && pendingCount == 0) {
            explanation.append(String.format(
                    "All %d tax record(s) show PAID status — property is tax compliant. ",
                    paidCount));
        }

        int currentYear = Year.now().getValue();
        boolean recentDelinquency = records.stream()
                .filter(r -> "OVERDUE".equalsIgnoreCase(r.getStatus()))
                .anyMatch(r -> r.getAssessmentYear() != null
                        && r.getAssessmentYear() >= currentYear - 3);
        if (recentDelinquency) {
            score += 10.0;
            explanation.append("Recent delinquency pattern detected (overdue within last 3 years). ");
            recommendation.append("Request 5-year tax payment history from municipality. ");
        }

        score = clamp(Math.min(score, config.getTax().getMaxScore()));

        if (recommendation.isEmpty()) {
            recommendation.append("Property tax records appear clean. " +
                    "Obtain official tax clearance certificate before purchase.");
        }

        String dataSource = taxResp.getDataSource() != null
                ? taxResp.getDataSource() : taxResp.getStatus().name();

        return new CategoryResult(cat, score, RiskLevel.fromScore(score),
                config.getWeights().getTax(),
                explanation.toString().trim(), recommendation.toString().trim(),
                dataSource, false);
    }

    // ── 4. ZONING (weight 15%) ────────────────────────────────────

    private CategoryResult scoreZoning(
            IntegrationResponse<ZoningInfo> zoningResp,
            AggregatedPropertyResponse agg) {

        RiskCategory cat = RiskCategory.ZONING;

        if (!isDataUsable(zoningResp)) {
            return unavailableResult(cat,
                    zoningResp != null ? zoningResp.getStatus().name() : "UNAVAILABLE",
                    "Zoning information could not be retrieved from master plan records.",
                    "Check zoning classification at local development authority " +
                    "(BDA/MCGM/DDA etc.) before purchase. Verify intended use is permitted.");
        }

        ZoningInfo info = zoningResp.getData();
        if (info == null) {
            return unavailableResult(cat, "NO_DATA",
                    "No zoning record found for this property.",
                    "Obtain zoning certificate from local development authority before purchase.");
        }

        double score = 0.0;
        StringBuilder explanation = new StringBuilder();
        StringBuilder recommendation = new StringBuilder();

        String zoneCategory = info.getZoneCategory();
        String propertyType = agg.getProperty() != null
                ? agg.getProperty().getPropertyType() : null;

        if (zoneCategory != null && propertyType != null) {
            boolean conflict = isZoningConflict(zoneCategory, propertyType);
            if (conflict) {
                score += 40.0;
                explanation.append(String.format(
                        "ZONING CONFLICT: Property type '%s' may not be permitted in " +
                        "'%s' zone (code: %s). ",
                        propertyType, zoneCategory,
                        info.getZoneCode() != null ? info.getZoneCode() : "unknown"));
                recommendation.append("Obtain zoning compliance certificate from local development authority. " +
                        "Confirm permitted uses with town planning department. ");
            } else {
                explanation.append(String.format(
                        "Property type '%s' is compatible with '%s' zone (code: %s). ",
                        propertyType, zoneCategory,
                        info.getZoneCode() != null ? info.getZoneCode() : "unknown"));
            }
        }

        if ("INDUSTRIAL".equalsIgnoreCase(zoneCategory)) {
            score += 20.0;
            explanation.append("Industrial zone — environmental and health risks for residential use. ");
            recommendation.append("Verify industrial zone does not restrict residential occupation. ");
        }

        if (info.getMaxFAR() != null && info.getMaxFAR() < 1.0) {
            score += 10.0;
            explanation.append(String.format(
                    "Low maximum FAR (%.2f) limits future development and resale value. ",
                    info.getMaxFAR()));
        }

        if (info.getRestrictedUses() != null && !info.getRestrictedUses().isEmpty()) {
            score += 5.0;
            explanation.append(String.format(
                    "%d restricted use(s) apply to this zone. ",
                    info.getRestrictedUses().size()));
            recommendation.append("Review all restricted uses before finalizing purchase intent. ");
        }

        if (info.getMasterPlanReference() != null) {
            explanation.append("Zoning governed by: ").append(info.getMasterPlanReference()).append(". ");
        }

        if (recommendation.isEmpty()) {
            recommendation.append("Zoning appears compatible. Obtain zoning compliance certificate " +
                    "and review master plan for any upcoming reclassification.");
        }

        score = clamp(score);
        String dataSource = zoningResp.getDataSource() != null
                ? zoningResp.getDataSource() : zoningResp.getStatus().name();

        return new CategoryResult(cat, score, RiskLevel.fromScore(score),
                config.getWeights().getZoning(),
                explanation.toString().trim(), recommendation.toString().trim(),
                dataSource, false);
    }

    // ── 5. ENVIRONMENTAL (weight 15%) ─────────────────────────────

    private CategoryResult scoreEnvironmental(IntegrationResponse<EnvironmentalInfo> envResp) {
        RiskCategory cat = RiskCategory.ENVIRONMENTAL;

        if (!isDataUsable(envResp)) {
            return unavailableResult(cat,
                    envResp != null ? envResp.getStatus().name() : "UNAVAILABLE",
                    "Environmental data (AQI, soil quality) could not be retrieved from CPCB.",
                    "Check CPCB AQI data at aqicn.org/map/india for this location. " +
                    "Request soil test report from local NABL-accredited lab.");
        }

        EnvironmentalInfo info = envResp.getData();
        if (info == null) {
            return unavailableResult(cat, "NO_DATA",
                    "No environmental data found for this property area.",
                    "Request soil quality report and verify AQI at nearest CPCB station.");
        }

        double score = 0.0;
        StringBuilder explanation = new StringBuilder();
        StringBuilder recommendation = new StringBuilder();

        String aqiCategory = info.getAqiCategory();
        if (aqiCategory != null) {
            switch (aqiCategory.toUpperCase()) {
                case "GOOD" -> {
                    score += config.getEnvironmental().getAqiGoodScore();
                    explanation.append("Air quality is GOOD — minimal health risk from air pollution. ");
                }
                case "SATISFACTORY" -> {
                    score += config.getEnvironmental().getAqiSatisfactoryScore();
                    explanation.append("Air quality is SATISFACTORY — acceptable for most residents. ");
                }
                case "MODERATE" -> {
                    score += config.getEnvironmental().getAqiModerateScore();
                    explanation.append("Air quality is MODERATE — may affect sensitive groups. ");
                    recommendation.append("Consider air purification systems if purchasing. ");
                }
                case "POOR" -> {
                    score += config.getEnvironmental().getAqiPoorScore();
                    explanation.append(String.format(
                            "Air quality is POOR (AQI: %s) — health effects possible for all residents. ",
                            info.getAirQualityIndex() != null ? info.getAirQualityIndex() : "N/A"));
                    if (info.getDominantPollutant() != null) {
                        explanation.append("Dominant pollutant: ").append(info.getDominantPollutant()).append(". ");
                    }
                    recommendation.append("Install high-grade air purification. " +
                            "Investigate source of pollution before purchase. ");
                }
                case "VERY_POOR" -> {
                    score += config.getEnvironmental().getAqiVeryPoorScore();
                    explanation.append(String.format(
                            "Air quality is VERY POOR (AQI: %s) — serious health risk. ",
                            info.getAirQualityIndex() != null ? info.getAirQualityIndex() : "N/A"));
                    if (info.getDominantPollutant() != null) {
                        explanation.append("Dominant pollutant: ").append(info.getDominantPollutant()).append(". ");
                    }
                    recommendation.append("This is a SERIOUS health concern. " +
                            "Negotiate significant price discount or avoid purchase. ");
                }
                case "SEVERE" -> {
                    score += config.getEnvironmental().getAqiSevereScore();
                    explanation.append(String.format(
                            "Air quality is SEVERE (AQI: %s) — emergency health conditions. ",
                            info.getAirQualityIndex() != null ? info.getAirQualityIndex() : "N/A"));
                    if (info.getDominantPollutant() != null) {
                        explanation.append("Dominant pollutant: ").append(info.getDominantPollutant()).append(". ");
                    }
                    recommendation.append("CRITICAL: Severe air quality poses immediate health risk. " +
                            "Do not purchase without independent environmental assessment. ");
                }
                default -> {
                    score += config.getUncertaintyPenalty();
                    explanation.append("Unknown AQI category: ").append(aqiCategory).append(". ");
                }
            }
        } else if (info.getAirQualityIndex() != null) {
            int aqi = info.getAirQualityIndex();
            if (aqi <= 50) {
                score += config.getEnvironmental().getAqiGoodScore();
                explanation.append(String.format("AQI %d — Good air quality. ", aqi));
            } else if (aqi <= 100) {
                score += config.getEnvironmental().getAqiSatisfactoryScore();
                explanation.append(String.format("AQI %d — Satisfactory air quality. ", aqi));
            } else if (aqi <= 200) {
                score += config.getEnvironmental().getAqiModerateScore();
                explanation.append(String.format("AQI %d — Moderate air quality. ", aqi));
            } else if (aqi <= 300) {
                score += config.getEnvironmental().getAqiPoorScore();
                explanation.append(String.format("AQI %d — Poor air quality. ", aqi));
            } else if (aqi <= 400) {
                score += config.getEnvironmental().getAqiVeryPoorScore();
                explanation.append(String.format("AQI %d — Very Poor air quality. ", aqi));
            } else {
                score += config.getEnvironmental().getAqiSevereScore();
                explanation.append(String.format("AQI %d — Severe air quality. ", aqi));
            }
        }

        if (Boolean.TRUE.equals(info.getNearIndustrialZone())) {
            score += config.getEnvironmental().getIndustrialZonePenalty();
            explanation.append("Property is near an industrial zone — elevated pollution and health risk. ");
            recommendation.append("Conduct independent air and soil quality tests. " +
                    "Check for industrial discharge permits in the area. ");
        }

        if (info.getNoiseLevelDb() != null
                && info.getNoiseLevelDb() >= config.getEnvironmental().getHighNoiseThresholdDb()) {
            score += config.getEnvironmental().getHighNoisePenalty();
            explanation.append(String.format(
                    "High noise level detected (%d dB) — above comfortable residential threshold (%d dB). ",
                    info.getNoiseLevelDb(), config.getEnvironmental().getHighNoiseThresholdDb()));
            recommendation.append("Consider acoustic insulation if purchasing. ");
        }

        if (info.getSoilType() != null) {
            String soil = info.getSoilType().toUpperCase();
            if (soil.contains("CONTAMINATED") || soil.contains("TOXIC")) {
                score += 20.0;
                explanation.append("CONTAMINATED soil detected — serious environmental liability. ");
                recommendation.append("Commission full soil remediation assessment before purchase. " +
                        "Contaminated land may have legal clean-up obligations. ");
            } else if (soil.contains("CLAY") || soil.contains("EXPANSIVE")) {
                score += 8.0;
                explanation.append("Clay/expansive soil detected — may cause structural issues. ");
                recommendation.append("Commission soil stability report for foundation assessment. ");
            } else {
                explanation.append("Soil type: ").append(info.getSoilType()).append(". ");
            }
        }

        if (info.getGreenCoveragePercent() != null && info.getGreenCoveragePercent() > 30.0) {
            score = Math.max(0, score - 5.0);
            explanation.append(String.format(
                    "Good green coverage (%.0f%%) in the area — positive environmental indicator. ",
                    info.getGreenCoveragePercent()));
        }

        if (recommendation.isEmpty()) {
            recommendation.append("Environmental conditions appear acceptable. " +
                    "Review latest CPCB AQI data periodically.");
        }

        score = clamp(score);
        String dataSource = envResp.getDataSource() != null
                ? envResp.getDataSource() : envResp.getStatus().name();

        return new CategoryResult(cat, score, RiskLevel.fromScore(score),
                config.getWeights().getEnvironmental(),
                explanation.toString().trim(), recommendation.toString().trim(),
                dataSource, false);
    }

    // ── 6. MARKET (weight 10%) ────────────────────────────────────

    private CategoryResult scoreMarket(AggregatedPropertyResponse agg) {
        RiskCategory cat = RiskCategory.MARKET;

        if (agg.getProperty() == null) {
            return unavailableResult(cat, "NO_DATA",
                    "Property base data not available for market risk assessment.",
                    "Verify property details are complete in the system.");
        }

        var prop = agg.getProperty();
        double score = 0.0;
        StringBuilder explanation = new StringBuilder();
        StringBuilder recommendation = new StringBuilder();

        if (prop.getYearBuilt() != null) {
            int age = Year.now().getValue() - prop.getYearBuilt();
            if (age >= config.getMarket().getVeryOldBuildingThresholdYears()) {
                score += 30.0;
                explanation.append(String.format(
                        "Property is %d years old — very old construction increases " +
                        "structural and maintenance risk. ", age));
                recommendation.append("Commission structural audit by certified civil engineer. ");
            } else if (age >= config.getMarket().getOldBuildingThresholdYears()) {
                score += 15.0;
                explanation.append(String.format(
                        "Property is %d years old — aging construction warrants inspection. ", age));
                recommendation.append("Consider pre-purchase home inspection. ");
            } else if (age <= 5) {
                explanation.append(String.format(
                        "Property is %d year(s) old — modern construction, lower age-related risk. ", age));
            } else {
                explanation.append(String.format("Property age: %d years. ", age));
            }
        } else {
            score += config.getUncertaintyPenalty() * 0.5;
            explanation.append("Year built not recorded — unable to assess age-related risk. ");
        }

        String condition = prop.getCondition();
        if (condition != null) {
            switch (condition.toUpperCase()) {
                case "EXCELLENT", "GOOD", "NEW" -> {
                    explanation.append("Property condition: ").append(condition)
                            .append(" — minimal condition risk. ");
                }
                case "FAIR", "AVERAGE" -> {
                    score += 10.0;
                    explanation.append("Property condition: ").append(condition)
                            .append(" — some wear and tear expected. ");
                    recommendation.append("Budget for maintenance and minor repairs. ");
                }
                case "OLD", "DATED" -> {
                    score += config.getMarket().getOldConditionScore();
                    explanation.append("Property condition is rated OLD/DATED — " +
                            "significant renovation costs likely. ");
                    recommendation.append("Get renovation cost estimate before purchase. " +
                            "Factor into negotiation. ");
                }
                case "POOR" -> {
                    score += config.getMarket().getPoorConditionScore();
                    explanation.append("Property condition is POOR — " +
                            "major structural or cosmetic issues likely. ");
                    recommendation.append("Commission full structural inspection. " +
                            "Negotiate substantial price reduction. ");
                }
                case "VERY_POOR", "DILAPIDATED" -> {
                    score += config.getMarket().getVeryPoorConditionScore();
                    explanation.append("Property condition is VERY POOR/DILAPIDATED — " +
                            "property may not be habitable without major renovation. ");
                    recommendation.append("CAUTION: Major renovation required. " +
                            "Get multiple contractor quotes before proceeding. ");
                }
                default -> {
                    explanation.append("Property condition: ").append(condition).append(". ");
                }
            }
        } else {
            score += config.getUncertaintyPenalty() * 0.5;
            explanation.append("Property condition not recorded. ");
        }

        if (Boolean.TRUE.equals(prop.getVerified())) {
            score = Math.max(0, score - config.getMarket().getVerifiedDiscount());
            explanation.append("Property is verified — reduces uncertainty in market risk. ");
        } else {
            score += 5.0;
            explanation.append("Property is not yet verified — data accuracy is unconfirmed. ");
            recommendation.append("Request property verification before purchase. ");
        }

        if (prop.getMarketValue() != null && prop.getArea() != null && prop.getArea() > 0) {
            double pricePerSqft = prop.getMarketValue() / prop.getArea();
            if (pricePerSqft < 500) {
                score += 10.0;
                explanation.append(String.format(
                        "Market value per sq.ft (₹%.0f) is unusually low — verify valuation accuracy. ",
                        pricePerSqft));
                recommendation.append("Get independent property valuation from registered valuer. ");
            } else if (pricePerSqft > 50000) {
                score += 5.0;
                explanation.append(String.format(
                        "Market value per sq.ft (₹%.0f) is very high — verify market comparables. ",
                        pricePerSqft));
            }
        }

        if (recommendation.isEmpty()) {
            recommendation.append("Market risk appears manageable. " +
                    "Obtain certified property valuation before finalizing purchase price.");
        }

        score = clamp(score);

        return new CategoryResult(cat, score, RiskLevel.fromScore(score),
                config.getWeights().getMarket(),
                explanation.toString().trim(), recommendation.toString().trim(),
                "PROPERTY_DB", false);
    }

    // ══════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════

    private double weightedScore(CategoryResult... categories) {
        double total = 0.0;
        for (CategoryResult c : categories) {
            total += c.score() * c.weight();
        }
        return total;
    }

    /**
     * Determines if an IntegrationResponse has usable data.
     * Safe against any IntegrationStatus enum values — uses name() comparison
     * to avoid compile errors if CACHED doesn't exist in the enum.
     */
    private boolean isDataUsable(IntegrationResponse<?> resp) {
        if (resp == null || resp.getStatus() == null) return false;
        String status = resp.getStatus().name();
        return status.equals("LIVE") || status.equals("MOCK") || status.equals("CACHED");
    }

    private boolean isZoningConflict(String zoneCategory, String propertyType) {
        if (zoneCategory == null || propertyType == null) return false;
        String zone = zoneCategory.toUpperCase();
        String type = propertyType.toUpperCase();

        if (zone.equals("INDUSTRIAL") &&
                (type.contains("RESIDENTIAL") || type.contains("APARTMENT") ||
                 type.contains("VILLA") || type.contains("HOUSE"))) {
            return true;
        }
        if (zone.equals("RESIDENTIAL") &&
                (type.contains("COMMERCIAL") || type.contains("INDUSTRIAL") ||
                 type.contains("WAREHOUSE") || type.contains("FACTORY"))) {
            return true;
        }
        return false;
    }

    private int countUnavailable(IntegrationResponse<?>... responses) {
        int count = 0;
        for (IntegrationResponse<?> r : responses) {
            if (!isDataUsable(r)) count++;
        }
        return count;
    }

    private CategoryResult unavailableResult(
            RiskCategory cat, String dataSource,
            String explanation, String recommendation) {
        double score = config.getUncertaintyPenalty();
        return new CategoryResult(
                cat, score, RiskLevel.fromScore(score), getCategoryWeight(cat),
                explanation, recommendation, dataSource, true);
    }

    private double getCategoryWeight(RiskCategory cat) {
        return switch (cat) {
            case FLOOD         -> config.getWeights().getFlood();
            case LEGAL         -> config.getWeights().getLegal();
            case TAX           -> config.getWeights().getTax();
            case ZONING        -> config.getWeights().getZoning();
            case ENVIRONMENTAL -> config.getWeights().getEnvironmental();
            case MARKET        -> config.getWeights().getMarket();
        };
    }

    private double clamp(double score) {
        return Math.min(100.0, Math.max(0.0, score));
    }

    private String buildSummary(
            double overallScore, RiskLevel overallLevel,
            CategoryResult flood, CategoryResult legal, CategoryResult tax,
            CategoryResult zoning, CategoryResult environmental, CategoryResult market,
            boolean dataIncomplete) {

        List<CategoryResult> sorted = new ArrayList<>(List.of(
                flood, legal, tax, zoning, environmental, market));
        sorted.sort(Comparator.comparingDouble(CategoryResult::score).reversed());

        CategoryResult top1 = sorted.get(0);
        CategoryResult top2 = sorted.get(1);

        StringBuilder sb = new StringBuilder();
        sb.append(String.format(
                "This property carries %s overall risk (score: %.0f/100). ",
                overallLevel.name(), overallScore));

        if (top1.score() > 50) {
            sb.append(String.format(
                    "Primary risk driver is %s (score: %.0f) — %s risk. ",
                    top1.category().name(), top1.score(), top1.level().name()));
        }
        if (top2.score() > 25) {
            sb.append(String.format(
                    "Secondary concern is %s (score: %.0f). ",
                    top2.category().name(), top2.score()));
        }

        switch (overallLevel) {
            case CRITICAL, HIGH ->
                    sb.append("Immediate professional due diligence is strongly recommended.");
            case MEDIUM ->
                    sb.append("Standard due diligence checks are advisable before finalizing.");
            default ->
                    sb.append("Property appears relatively low-risk. Standard verification recommended.");
        }

        if (dataIncomplete) {
            sb.append(" Note: some data sources were unavailable — scores may be conservative estimates.");
        }

        return sb.toString();
    }

    private List<RiskFactor> buildFactorEntities(CategoryResult... categories) {
        List<RiskFactor> factors = new ArrayList<>();
        for (CategoryResult c : categories) {
            factors.add(RiskFactor.builder()
                    .category(c.category())
                    .score(c.score())
                    .level(c.level())
                    .weight(c.weight())
                    .explanation(c.explanation())
                    .recommendation(c.recommendation())
                    .dataSource(c.dataSource())
                    .build());
        }
        return factors;
    }

    private RiskBreakdownDto buildBreakdownDto(
            Long propertyId, double overall, RiskLevel overallLevel,
            CategoryResult flood, CategoryResult legal, CategoryResult tax,
            CategoryResult zoning, CategoryResult environmental, CategoryResult market,
            boolean dataIncomplete, int unavailableCount) {

        List<RiskFactorDto> factorDtos = new ArrayList<>(List.of(
                toFactorDto(flood), toFactorDto(legal), toFactorDto(tax),
                toFactorDto(zoning), toFactorDto(environmental), toFactorDto(market)));
        factorDtos.sort(Comparator.comparingDouble(RiskFactorDto::getScore).reversed());

        return RiskBreakdownDto.builder()
                .propertyId(propertyId)
                .overallScore(overall)
                .overallLevel(overallLevel)
                .floodScore(flood.score())
                .legalScore(legal.score())
                .taxScore(tax.score())
                .zoningScore(zoning.score())
                .environmentalScore(environmental.score())
                .marketScore(market.score())
                .factors(factorDtos)
                .dataIncomplete(dataIncomplete)
                .unavailableProviderCount(unavailableCount)
                .calculatedAt(Instant.now())
                .build();
    }

    private RiskFactorDto toFactorDto(CategoryResult c) {
        return RiskFactorDto.builder()
                .category(c.category())
                .score(c.score())
                .level(c.level())
                .weight(c.weight())
                .explanation(c.explanation())
                .recommendation(c.recommendation())
                .dataSource(c.dataSource())
                .dataUncertain(c.dataUncertain())
                .build();
    }

    private record CategoryResult(
            RiskCategory category,
            double score,
            RiskLevel level,
            double weight,
            String explanation,
            String recommendation,
            String dataSource,
            boolean dataUncertain
    ) {}
}