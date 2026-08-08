// backend/src/main/java/com/realestate/duediligence/service/PdfReportDataProvider.java
package com.realestate.duediligence.service;

import com.realestate.duediligence.aggregation.AggregatedPropertyResponse;
import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.entity.RiskAssessment;

/**
 * Loads all structured data needed to render a premium PDF report.
 *
 * <p>Bundles report metadata + risk breakdown + property aggregation into
 * a single {@link PdfReportBundle}, so PDF renderers don't need to touch
 * repositories or coordinate multiple service calls.
 *
 * <p>Kept separate from {@link DueDiligenceReportService} to preserve
 * separation of concerns: DueDiligenceReportService handles report lifecycle
 * (create/generate/status), while this provider handles export data loading.
 */
public interface PdfReportDataProvider {

    /**
     * Loads everything needed to render a full PDF report for a given ID.
     *
     * @param reportId ID of the report to export
     * @return bundle containing all structured data (never null)
     * @throws RuntimeException if the report doesn't exist or user is unauthorized
     */
    PdfReportBundle loadBundle(Long reportId);

    /**
     * Immutable value object holding all data a PDF renderer needs.
     * Any field may be null if the corresponding data isn't available —
     * renderers must handle nulls gracefully.
     */
    class PdfReportBundle {
        public final DueDiligenceReportResponse report;
        public final RiskAssessment assessment;
        public final RiskBreakdownDto breakdown;
        public final AggregatedPropertyResponse aggregated;

        public PdfReportBundle(DueDiligenceReportResponse report,
                               RiskAssessment assessment,
                               RiskBreakdownDto breakdown,
                               AggregatedPropertyResponse aggregated) {
            this.report = report;
            this.assessment = assessment;
            this.breakdown = breakdown;
            this.aggregated = aggregated;
        }
    }
}