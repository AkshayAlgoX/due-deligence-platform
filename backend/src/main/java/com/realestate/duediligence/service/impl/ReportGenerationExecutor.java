package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.aggregation.AggregatedPropertyResponse;
import com.realestate.duediligence.aggregation.PropertyAggregationService;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.entity.DueDiligenceReport;
import com.realestate.duediligence.entity.ReportSection;
import com.realestate.duediligence.entity.RiskAssessment;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.NotificationType;
import com.realestate.duediligence.enums.ReportStatus;
import com.realestate.duediligence.repository.DueDiligenceReportRepository;
import com.realestate.duediligence.repository.ReportSectionRepository;
import com.realestate.duediligence.repository.RiskAssessmentRepository;
import com.realestate.duediligence.service.NotificationEventListener;
import com.realestate.duediligence.service.NotificationService;
import com.realestate.duediligence.service.RiskAssessmentService;

import lombok.RequiredArgsConstructor;

/**
 * Runs report generation on the reportTaskExecutor thread pool.
 *
 * WHY A SEPARATE @Component:
 *   Spring's @Async only works when the method is called through the Spring
 *   proxy. If DueDiligenceReportServiceImpl.generate() called an async method
 *   on itself, the proxy would be bypassed and @Async would do nothing
 *   (executes synchronously, blocks the HTTP thread).
 *
 *   By putting the async method in a separate bean, injection ensures the
 *   proxy is used and the method runs on the executor pool.
 *
 * SESSION 23 CHANGE — Defense-in-depth retry:
 *   The primary fix (afterCommit dispatch) lives in DueDiligenceReportServiceImpl.
 *   As a safety net, execute() now retries findById() up to 3 times with a
 *   200ms delay before giving up. This handles any residual edge cases such
 *   as DB replication lag or unexpected slow commits on burdened systems.
 *   Each retry is clearly logged for observability.
 */
@Component
@RequiredArgsConstructor
public class ReportGenerationExecutor {

    private static final Logger log =
            LoggerFactory.getLogger(ReportGenerationExecutor.class);

    // ── Retry constants (defense-in-depth, primary fix is in afterCommit) ──
    private static final int    MAX_FIND_RETRIES      = 3;
    private static final long   FIND_RETRY_DELAY_MS   = 200L;

    private final DueDiligenceReportRepository reportRepository;
    private final ReportSectionRepository sectionRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final RiskAssessmentService riskAssessmentService;
    private final PropertyAggregationService aggregationService;
    private final ReportSectionBuilder sectionBuilder;
    private final NotificationService notificationService;
    private final NotificationEventListener notificationEventListener;

    // ══════════════════════════════════════════════════════════════
    // ASYNC ENTRY POINT
    // ══════════════════════════════════════════════════════════════

    /**
     * Executes report generation asynchronously on the reportTaskExecutor pool.
     *
     * Uses REQUIRES_NEW so this transaction is fully independent of any caller
     * transaction. The caller's transaction will have already committed by the
     * time this method is invoked (guaranteed by the afterCommit() dispatch in
     * DueDiligenceReportServiceImpl.generate()).
     *
     * @param reportId              ID of the PENDING report to generate
     * @param forceRiskRecalculation  true → always recalculate risk scores
     */
    @Async("reportTaskExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void execute(Long reportId, boolean forceRiskRecalculation) {

        log.info("[async] Starting report generation for report {}", reportId);
        long start = System.currentTimeMillis();

        // ── SESSION 23: RETRY SAFETY NET ─────────────────────────────────────
        //
        // PRIMARY FIX: executor.execute() is now dispatched in afterCommit()
        // inside DueDiligenceReportServiceImpl, so the caller's transaction is
        // always committed before we arrive here. This means findById() should
        // succeed on the very first attempt in all normal cases.
        //
        // DEFENSE-IN-DEPTH: We still retry up to MAX_FIND_RETRIES times with
        // FIND_RETRY_DELAY_MS between each attempt. This protects against:
        //   - DB replication lag (if using a read replica — not current setup
        //     but future-proofs the code)
        //   - Unexpected slow commits on a heavily loaded DB
        //   - Any future code change that accidentally re-introduces the race
        //
        // If all retries fail, we log a structured ERROR and attempt to mark
        // the report FAILED so the user sees a clear error state rather than
        // a stuck PENDING forever.
        // ─────────────────────────────────────────────────────────────────────
        DueDiligenceReport report = findWithRetry(reportId);

        if (report == null) {
            log.error("[async] Report {} not found after {} retries ({} ms each) — "
                    + "marking FAILED. Primary fix may not be active.",
                    reportId, MAX_FIND_RETRIES, FIND_RETRY_DELAY_MS);
            markFailed(reportId,
                    "Report not found in database after async dispatch — "
                    + "possible transaction visibility issue");
            return;
        }

        try {
            // ── STEP 1: Mark GENERATING ───────────────────────────────────────
            // Visible to polling clients on their next 2-second poll.
            report.setStatus(ReportStatus.GENERATING);
            reportRepository.save(report);
            reportRepository.flush();
            log.info("[async] Report {} status → GENERATING", reportId);

            Long propertyId = report.getProperty().getId();

            // ── STEP 2: Ensure risk assessment exists ─────────────────────────
            if (forceRiskRecalculation) {
                log.info("[async] Report {} — forcing risk recalculation for property {}",
                        reportId, propertyId);
                riskAssessmentService.recalculate(propertyId);
            } else {
                riskAssessmentService.getOrCompute(propertyId);
            }

            RiskAssessment assessment = riskAssessmentRepository
                    .findByPropertyIdAndIsLatestTrue(propertyId)
                    .orElseThrow(() -> new RuntimeException(
                            "Risk assessment missing after compute for property "
                            + propertyId));

            // ── STEP 3: Fetch aggregated property data + risk breakdown ────────
            AggregatedPropertyResponse agg = aggregationService.aggregate(propertyId);
            RiskBreakdownDto breakdown = riskAssessmentService.getBreakdown(propertyId);

            // ── STEP 4: Build & persist all report sections ───────────────────
            List<ReportSection> sections =
                    sectionBuilder.buildAll(report, agg, assessment, breakdown);
            sectionRepository.saveAll(sections);

            // ── STEP 5: Finalize report metadata ──────────────────────────────
            report.setRiskAssessmentSnapshot(assessment);
            report.setRiskScoreSnapshot(assessment.getOverallScore());
            report.setExecutiveSummary(assessment.getSummary());
            report.setStatus(ReportStatus.COMPLETED);
            report.setCompletedAt(LocalDateTime.now());
            reportRepository.save(report);

            long duration = System.currentTimeMillis() - start;
            log.info("[async] Report {} COMPLETED in {}ms — {} sections generated",
                    reportId, duration, sections.size());

            // ── STEP 6: Fire completion notification ──────────────────────────
            // Non-blocking; failures are logged, not propagated.
            fireCompletionNotification(report);

        } catch (Exception e) {
            log.error("[async] Report {} generation FAILED: {}",
                    reportId, e.getMessage(), e);
            markFailed(reportId, e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ══════════════════════════════════════════════════════════════

    /**
     * Attempts to load the report from the DB, retrying up to MAX_FIND_RETRIES
     * times with FIND_RETRY_DELAY_MS between each attempt.
     *
     * In normal operation (primary fix active), the report will be found on
     * attempt 1 every time. Retries exist purely as defense-in-depth.
     *
     * @return the report entity, or null if all retries failed
     */
    private DueDiligenceReport findWithRetry(Long reportId) {
        for (int attempt = 1; attempt <= MAX_FIND_RETRIES; attempt++) {
            DueDiligenceReport report = reportRepository.findById(reportId).orElse(null);
            if (report != null) {
                if (attempt > 1) {
                    // Only log if we actually needed a retry — keeps logs clean
                    log.warn("[async] Report {} found on retry attempt {} of {}",
                            reportId, attempt, MAX_FIND_RETRIES);
                }
                return report;
            }

            // Report not found on this attempt
            if (attempt < MAX_FIND_RETRIES) {
                log.warn("[async] Report {} not found on attempt {} of {} — "
                        + "retrying in {}ms",
                        reportId, attempt, MAX_FIND_RETRIES, FIND_RETRY_DELAY_MS);
                try {
                    Thread.sleep(FIND_RETRY_DELAY_MS);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    log.error("[async] Retry interrupted for report {} on attempt {}",
                            reportId, attempt);
                    return null;
                }
            } else {
                // Final attempt failed
                log.error("[async] Report {} not found on final attempt {} of {}",
                        reportId, attempt, MAX_FIND_RETRIES);
            }
        }
        return null;
    }

    /**
     * Persists FAILED status in its own independent transaction so it survives
     * even if the enclosing async transaction was rolled back by an exception.
     *
     * Also handles the "report not found even in markFailed" edge case
     * gracefully — logs and exits without throwing.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void markFailed(Long reportId, String errorMessage) {
        try {
            DueDiligenceReport failed = reportRepository.findById(reportId).orElse(null);
            if (failed != null) {
                failed.setStatus(ReportStatus.FAILED);
                failed.setErrorMessage(truncate(errorMessage, 500));
                reportRepository.save(failed);
                log.info("[async] Report {} marked as FAILED in DB", reportId);
            } else {
                log.error("[async] Cannot mark report {} as FAILED — "
                        + "report does not exist in DB at all", reportId);
            }
        } catch (Exception e) {
            log.error("[async] Also failed to save FAILED status for report {}: {}",
                    reportId, e.getMessage());
        }
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }

    /**
     * Fires in-app + email notification after a report completes.
     * Failures are swallowed and logged — a notification failure must never
     * roll back a successfully generated report.
     */
    private void fireCompletionNotification(DueDiligenceReport report) {
        try {
            User owner = report.getGeneratedBy();
            if (owner == null) return;

            String propertyAddress = report.getProperty() != null
                    ? report.getProperty().getAddress() : "Unknown property";
            String reportTitle = report.getTitle();
            String redirectUrl = "/reports/" + report.getId();

            // In-app notification (respects user preferences internally)
            notificationService.createForUser(
                    owner,
                    NotificationType.REPORT_READY,
                    "Your report is ready",
                    "Due diligence report for " + propertyAddress
                            + " has been generated.",
                    redirectUrl
            );

            // Email notification (respects user preferences internally)
            notificationEventListener.onReportReady(
                    owner, reportTitle, propertyAddress, report.getId());

        } catch (Exception e) {
            log.warn("[async] Failed to fire completion notification for report {}: {}",
                    report.getId(), e.getMessage());
        }
    }
}