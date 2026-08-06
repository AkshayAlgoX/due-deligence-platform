// backend/src/main/java/com/realestate/duediligence/service/DueDiligenceReportService.java
package com.realestate.duediligence.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.GenerateReportRequest;
import com.realestate.duediligence.dto.ReportSummaryDto;
import com.realestate.duediligence.enums.ReportStatus;

/**
 * Service contract for due diligence report operations.
 *
 * ── Lifecycle ─────────────────────────────────────────────────────────────
 *
 * 1. generate(request) — creates PENDING report, kicks off async build.
 *    Returns immediately with report shell (status=PENDING or GENERATING).
 *
 * 2. getStatus(reportId) — poll endpoint. Frontend calls every 2s until
 *    status is terminal (COMPLETED or FAILED).
 *
 * 3. getReport(reportId) — full report with all sections.
 *    Only usable when status=COMPLETED.
 *
 * 4. list(page) — paginated report list for current user.
 *
 * 5. delete(reportId) — hard delete (permitted for own reports + admin).
 *
 * 6. regenerate(reportId) — creates a NEW report (new ID, version+1)
 *    for the same property. Original report is preserved for audit.
 *
 * 7. getReportsForProperty(propertyId) — all report versions for one property.
 */
public interface DueDiligenceReportService {

    /**
     * Creates a new report and dispatches async generation.
     * Returns immediately — do not wait for content to be built.
     *
     * Idempotency: if a PENDING or GENERATING report already exists
     * for the same property + user in the last 60 seconds, returns
     * that existing report instead of creating a duplicate.
     */
    DueDiligenceReportResponse generate(GenerateReportRequest request);

    /**
     * Fast status check — used by frontend polling.
     * Cheap query (no sections loaded).
     */
    ReportStatus getStatus(Long reportId);

    /** Full report with all sections. Access control enforced. */
    DueDiligenceReportResponse getReport(Long reportId);

    /** Paginated user reports, newest first. */
    Page<ReportSummaryDto> list(Pageable pageable);

    /** Deletes a report. Only owner or admin. Fails if already deleted. */
    void delete(Long reportId);

    /**
     * Regenerates a report — creates a NEW report record (new ID, version+1).
     * Original report is preserved. Returns the new report shell.
     */
    DueDiligenceReportResponse regenerate(Long reportId);

    /** All reports for a specific property, latest version first. */
    java.util.List<ReportSummaryDto> getReportsForProperty(Long propertyId);
}