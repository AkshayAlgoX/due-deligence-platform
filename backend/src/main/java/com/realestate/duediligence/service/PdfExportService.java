// backend/src/main/java/com/realestate/duediligence/service/PdfExportService.java
package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.DueDiligenceReportResponse;

/**
 * PDF export service — produces both premium full reports and quick snapshots.
 *
 * <p>Full-report generation uses the "renderer pipeline" architecture:
 * data is loaded via {@link PdfReportDataProvider}, then flows through
 * a series of section renderers that build the PDF using structured data
 * (not plain text). This produces publication-quality output with charts,
 * tables, badges, and proper typography.
 */
public interface PdfExportService {

    /**
     * Generates the premium full due diligence report PDF.
     *
     * <p>This is the preferred method. It internally loads all structured
     * data (risk breakdown, aggregated property data, factors) needed to
     * render charts, badges, and structured sections.
     *
     * @param reportId ID of the report to render
     * @return PDF bytes
     */
    byte[] generatePdfReport(Long reportId);

    /**
     * Legacy bridge for callers that already have a report DTO.
     * Extracts the report ID and delegates to {@link #generatePdfReport(Long)}.
     *
     * @deprecated Prefer {@link #generatePdfReport(Long)} — passing a full DTO
     *             is wasteful since the new pipeline reloads structured data anyway.
     */
    @Deprecated
    byte[] generatePdfReport(DueDiligenceReportResponse report);

    /**
     * Generates a quick 1-2 page property snapshot PDF.
     * Uses the older direct-rendering path — not part of the renderer pipeline.
     */
    byte[] generatePropertySnapshotPdf(DueDiligenceReportResponse report);
}