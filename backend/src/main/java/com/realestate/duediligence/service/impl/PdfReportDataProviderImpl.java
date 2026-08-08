// backend/src/main/java/com/realestate/duediligence/service/impl/PdfReportDataProviderImpl.java
package com.realestate.duediligence.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.aggregation.AggregatedPropertyResponse;
import com.realestate.duediligence.aggregation.PropertyAggregationService;
import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.entity.RiskAssessment;
import com.realestate.duediligence.repository.RiskAssessmentRepository;
import com.realestate.duediligence.service.DueDiligenceReportService;
import com.realestate.duediligence.service.PdfReportDataProvider;
import com.realestate.duediligence.service.RiskAssessmentService;

import lombok.RequiredArgsConstructor;

/**
 * Loads structured data for premium PDF rendering.
 *
 * <p>Combines:
 * <ol>
 *   <li>Report snapshot from DueDiligenceReportService (metadata + sections)</li>
 *   <li>RiskAssessment entity (raw scores, factors, snapshot info)</li>
 *   <li>RiskBreakdownDto (per-category scores + factor explanations)</li>
 *   <li>AggregatedPropertyResponse (all property + integration data)</li>
 * </ol>
 *
 * <p>All data loading happens in a single read-only transaction to ensure
 * a consistent view. Failures in secondary data (breakdown, aggregation)
 * degrade gracefully — the report still renders with whatever data is
 * available, and null fields are handled by renderers.
 */
@Service
@RequiredArgsConstructor
public class PdfReportDataProviderImpl implements PdfReportDataProvider {

    private static final Logger log = LoggerFactory.getLogger(PdfReportDataProviderImpl.class);

    private final DueDiligenceReportService reportService;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final RiskAssessmentService riskAssessmentService;
    private final PropertyAggregationService aggregationService;

    @Override
    @Transactional(readOnly = true)
    public PdfReportBundle loadBundle(Long reportId) {
        log.info("[pdf-data] Loading report bundle for report {}", reportId);
        long start = System.currentTimeMillis();

        // 1. Load report snapshot (throws if not found or unauthorized)
        DueDiligenceReportResponse report = reportService.getReport(reportId);
        Long propertyId = report.getPropertyId();

        // 2. Load risk assessment entity (best-effort — may be null on legacy data)
        RiskAssessment assessment = null;
        try {
            assessment = riskAssessmentRepository
                    .findByPropertyIdAndIsLatestTrue(propertyId)
                    .orElse(null);
            if (assessment == null) {
                log.warn("[pdf-data] No latest RiskAssessment found for property {}", propertyId);
            }
        } catch (Exception e) {
            log.warn("[pdf-data] Failed to load RiskAssessment for property {}: {}",
                    propertyId, e.getMessage());
        }

        // 3. Load per-category breakdown (best-effort)
        RiskBreakdownDto breakdown = null;
        try {
            breakdown = riskAssessmentService.getBreakdown(propertyId);
        } catch (Exception e) {
            log.warn("[pdf-data] Failed to load RiskBreakdown for property {}: {}",
                    propertyId, e.getMessage());
        }

        // 4. Load full property aggregation (best-effort)
        AggregatedPropertyResponse aggregated = null;
        try {
            aggregated = aggregationService.aggregate(propertyId);
        } catch (Exception e) {
            log.warn("[pdf-data] Failed to load Aggregation for property {}: {}",
                    propertyId, e.getMessage());
        }

        long duration = System.currentTimeMillis() - start;
        log.info("[pdf-data] Bundle loaded for report {} in {}ms " +
                        "(assessment={}, breakdown={}, aggregated={})",
                reportId, duration,
                assessment != null,
                breakdown != null,
                aggregated != null);

        return new PdfReportBundle(report, assessment, breakdown, aggregated);
    }
}