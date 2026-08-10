// backend/src/main/java/com/realestate/duediligence/service/impl/ReportGenerationExecutor.java
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
import com.realestate.duediligence.entity.AuditLog;
import com.realestate.duediligence.entity.DueDiligenceReport;
import com.realestate.duediligence.entity.ReportHistory;
import com.realestate.duediligence.entity.ReportSection;
import com.realestate.duediligence.entity.RiskAssessment;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.AuditAction;
import com.realestate.duediligence.enums.NotificationType;
import com.realestate.duediligence.enums.ReportStatus;
import com.realestate.duediligence.repository.DueDiligenceReportRepository;
import com.realestate.duediligence.repository.ReportHistoryRepository;
import com.realestate.duediligence.repository.ReportSectionRepository;
import com.realestate.duediligence.repository.RiskAssessmentRepository;
import com.realestate.duediligence.service.AuditLogService;
import com.realestate.duediligence.service.NotificationEventListener;
import com.realestate.duediligence.service.NotificationService;
import com.realestate.duediligence.service.RiskAssessmentService;

import lombok.RequiredArgsConstructor;

/**
 * Runs report generation on the reportTaskExecutor thread pool.
 *
 * Responsibilities:
 *  - Generate the due diligence report asynchronously
 *  - Calculate/fetch the latest risk assessment
 *  - Generate all report sections
 *  - Save the completed report
 *  - Create a ReportHistory record
 *  - Create REPORT_GENERATED audit log
 *  - Send completion notifications
 *
 * WHY A SEPARATE @COMPONENT:
 * Spring's @Async only works when the method is called through the
 * Spring proxy. By putting the async method in a separate bean,
 * the proxy is used correctly.
 */
@Component
@RequiredArgsConstructor
public class ReportGenerationExecutor {

    private static final Logger log =
            LoggerFactory.getLogger(ReportGenerationExecutor.class);

    private final DueDiligenceReportRepository reportRepository;
    private final ReportHistoryRepository reportHistoryRepository;
    private final ReportSectionRepository sectionRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final RiskAssessmentService riskAssessmentService;
    private final PropertyAggregationService aggregationService;
    private final ReportSectionBuilder sectionBuilder;
    private final NotificationService notificationService;
    private final NotificationEventListener notificationEventListener;

    // =========================================================
    // AUDIT LOG SERVICE
    // =========================================================

    private final AuditLogService auditLogService;

    /**
     * Executes report generation asynchronously.
     *
     * Uses REQUIRES_NEW so the async transaction is independent
     * of the caller's transaction.
     */
    @Async("reportTaskExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void execute(
            Long reportId,
            boolean forceRiskRecalculation) {

        log.info(
                "[async] Starting report generation for report {}",
                reportId
        );

        long start = System.currentTimeMillis();

        DueDiligenceReport report =
                reportRepository.findById(reportId).orElse(null);

        if (report == null) {
            log.error(
                    "[async] Report {} vanished before generation started",
                    reportId
            );
            return;
        }

        try {

            // =========================================================
            // 1. Mark report as GENERATING
            // =========================================================

            report.setStatus(ReportStatus.GENERATING);

            reportRepository.save(report);
            reportRepository.flush();

            Long propertyId = report.getProperty().getId();

            // =========================================================
            // 2. Ensure risk assessment exists
            // =========================================================

            if (forceRiskRecalculation) {

                log.info(
                        "[async] Recalculating risk assessment for property {}",
                        propertyId
                );

                riskAssessmentService.recalculate(propertyId);

            } else {

                log.info(
                        "[async] Getting/computing risk assessment for property {}",
                        propertyId
                );

                riskAssessmentService.getOrCompute(propertyId);
            }

            // =========================================================
            // 3. Fetch latest risk assessment
            // =========================================================

            RiskAssessment assessment =
                    riskAssessmentRepository
                            .findByPropertyIdAndIsLatestTrue(propertyId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Risk assessment missing after compute for property "
                                                    + propertyId
                                    )
                            );

            log.info(
                    "[async] Risk assessment {} found for property {}. Score={}",
                    assessment.getId(),
                    propertyId,
                    assessment.getOverallScore()
            );

            // =========================================================
            // 4. Aggregate property data
            // =========================================================

            AggregatedPropertyResponse agg =
                    aggregationService.aggregate(propertyId);

            // =========================================================
            // 5. Fetch risk breakdown
            // =========================================================

            RiskBreakdownDto breakdown =
                    riskAssessmentService.getBreakdown(propertyId);

            // =========================================================
            // 6. Build all report sections
            // =========================================================

            List<ReportSection> sections =
                    sectionBuilder.buildAll(
                            report,
                            agg,
                            assessment,
                            breakdown
                    );

            sectionRepository.saveAll(sections);

            log.info(
                    "[async] Saved {} report sections for report {}",
                    sections.size(),
                    reportId
            );

            // =========================================================
            // 7. Finalize report metadata
            // =========================================================

            report.setRiskAssessmentSnapshot(assessment);

            report.setRiskScoreSnapshot(
                    assessment.getOverallScore()
            );

            report.setExecutiveSummary(
                    assessment.getSummary()
            );

            report.setStatus(ReportStatus.COMPLETED);

            report.setCompletedAt(
                    LocalDateTime.now()
            );

            reportRepository.save(report);

            // =========================================================
            // 8. Create Report History record
            // =========================================================

            saveReportHistory(
                    report,
                    assessment
            );

            // =========================================================
            // 9. CREATE AUDIT LOG
            // =========================================================
            //
            // This was missing in your previous code.
            //
            // This creates:
            //
            // action = REPORT_GENERATED
            // resourceType = REPORT
            // resourceId = report.id
            //
            // Your AuditLogServiceImpl already counts
            // REPORT_GENERATED, so this fixes:
            //
            // "Reports Generated = 0"
            // =========================================================

            saveReportGeneratedAuditLog(report);

            // =========================================================
            // 10. Log completion
            // =========================================================

            long duration =
                    System.currentTimeMillis() - start;

            log.info(
                    "[async] Report {} COMPLETED in {}ms — {} sections generated",
                    reportId,
                    duration,
                    sections.size()
            );

            // =========================================================
            // 11. Fire completion notification
            // =========================================================

            fireCompletionNotification(report);

        } catch (Exception e) {

            log.error(
                    "[async] Report {} generation FAILED: {}",
                    reportId,
                    e.getMessage(),
                    e
            );

            markFailed(
                    reportId,
                    e.getMessage()
            );
        }
    }

    /**
     * Creates a REPORT_GENERATED audit log after a report
     * has successfully completed.
     */
    private void saveReportGeneratedAuditLog(
            DueDiligenceReport report) {

        try {

            User user = report.getGeneratedBy();

            AuditLog logEntry = new AuditLog();

            // ---------------------------------------------------------
            // User who generated the report
            // ---------------------------------------------------------

            logEntry.setUser(user);

            // ---------------------------------------------------------
            // Audit action
            // ---------------------------------------------------------

            logEntry.setAction(
                    AuditAction.REPORT_GENERATED
            );

            // ---------------------------------------------------------
            // Resource information
            // ---------------------------------------------------------

            logEntry.setResourceType("REPORT");

            logEntry.setResourceId(
                    report.getId()
            );

            // ---------------------------------------------------------
            // Additional details
            // ---------------------------------------------------------

            String propertyAddress =
                    report.getProperty() != null
                            ? report.getProperty().getAddress()
                            : "Unknown property";

            String details =
                    "Due diligence report generated successfully"
                            + " | Report ID: " + report.getId()
                            + " | Property: " + propertyAddress
                            + " | Version: " + report.getVersion();

            logEntry.setDetailsJson(details);

            // ---------------------------------------------------------
            // Timestamp
            // ---------------------------------------------------------

            logEntry.setCreatedAt(
                    LocalDateTime.now()
            );

            // ---------------------------------------------------------
            // Save audit log
            // ---------------------------------------------------------

            auditLogService.save(logEntry);

            log.info(
                    "[async] REPORT_GENERATED audit log created "
                            + "for report {}",
                    report.getId()
            );

        } catch (Exception e) {

            /*
             * Audit logging should not make a successfully generated
             * report fail.
             */
            log.warn(
                    "[async] Failed to create REPORT_GENERATED "
                            + "audit log for report {}: {}",
                    report.getId(),
                    e.getMessage()
            );
        }
    }

    /**
     * Creates a ReportHistory record after a report is successfully
     * completed.
     *
     * IMPORTANT:
     *
     * DueDiligenceReport.id and ReportHistory.id are different IDs.
     *
     * Example:
     *
     * DueDiligenceReport
     *     id = 5
     *
     * ReportHistory
     *     id = 1
     *     reportId = "5"
     */
    private void saveReportHistory(
            DueDiligenceReport report,
            RiskAssessment assessment) {

        String reportId =
                String.valueOf(report.getId());

        // ---------------------------------------------------------
        // Prevent duplicate history records
        // ---------------------------------------------------------

        if (reportHistoryRepository.existsByReportId(reportId)) {

            log.info(
                    "[async] Report history already exists for report {}",
                    report.getId()
            );

            return;
        }

        // ---------------------------------------------------------
        // Create history entity
        // ---------------------------------------------------------

        ReportHistory history =
                new ReportHistory();

        history.setReportId(reportId);

        history.setProperty(
                report.getProperty()
        );

        history.setUser(
                report.getGeneratedBy()
        );

        history.setVersion(
                report.getVersion()
        );

        // ---------------------------------------------------------
        // Map actual risk level from RiskAssessment
        // ---------------------------------------------------------

        if (assessment != null
                && assessment.getOverallLevel() != null) {

            history.setRiskLevel(
                    assessment.getOverallLevel().name()
            );
        }

        // ---------------------------------------------------------
        // DueDiligenceReport currently doesn't have a
        // generated file path, so keep this null.
        // ---------------------------------------------------------

        history.setFilePath(null);

        // ---------------------------------------------------------
        // New history records are active
        // ---------------------------------------------------------

        history.setIsArchived(false);

        // ---------------------------------------------------------
        // Use report creation time
        // ---------------------------------------------------------

        history.setCreatedAt(
                report.getCreatedAt() != null
                        ? report.getCreatedAt()
                        : LocalDateTime.now()
        );

        // ---------------------------------------------------------
        // Save history
        // ---------------------------------------------------------

        ReportHistory savedHistory =
                reportHistoryRepository.save(history);

        log.info(
                "[async] Report history created successfully: "
                        + "historyId={}, reportId={}, propertyId={}, version={}",
                savedHistory.getId(),
                savedHistory.getReportId(),
                report.getProperty() != null
                        ? report.getProperty().getId()
                        : null,
                savedHistory.getVersion()
        );
    }

    /**
     * Persists FAILED status in its own transaction so it survives
     * even if the enclosing async transaction is rolled back.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void markFailed(
            Long reportId,
            String errorMessage) {

        try {

            DueDiligenceReport failed =
                    reportRepository
                            .findById(reportId)
                            .orElse(null);

            if (failed != null) {

                failed.setStatus(
                        ReportStatus.FAILED
                );

                failed.setErrorMessage(
                        truncate(errorMessage, 500)
                );

                reportRepository.save(failed);
            }

        } catch (Exception e) {

            log.error(
                    "[async] Also failed to save FAILED status for report {}: {}",
                    reportId,
                    e.getMessage()
            );
        }
    }

    /**
     * Truncate error message before storing it in database.
     */
    private String truncate(
            String s,
            int max) {

        if (s == null) {
            return null;
        }

        return s.length() <= max
                ? s
                : s.substring(0, max) + "...";
    }

    /**
     * Fires in-app + email notification after a report completes.
     *
     * Failures are logged and do not break report generation.
     */
    private void fireCompletionNotification(
            DueDiligenceReport report) {

        try {

            User owner =
                    report.getGeneratedBy();

            if (owner == null) {
                return;
            }

            String propertyAddress =
                    report.getProperty() != null
                            ? report.getProperty().getAddress()
                            : "Unknown property";

            String reportTitle =
                    report.getTitle();

            String redirectUrl =
                    "/reports/" + report.getId();

            // -----------------------------------------------------
            // In-app notification
            // -----------------------------------------------------

            notificationService.createForUser(
                    owner,
                    NotificationType.REPORT_READY,
                    "Your report is ready",
                    "Due diligence report for "
                            + propertyAddress
                            + " has been generated.",
                    redirectUrl
            );

            // -----------------------------------------------------
            // Email notification
            // -----------------------------------------------------

            notificationEventListener.onReportReady(
                    owner,
                    reportTitle,
                    propertyAddress,
                    report.getId()
            );

        } catch (Exception e) {

            log.warn(
                    "[async] Failed to fire completion notification "
                            + "for report {}: {}",
                    report.getId(),
                    e.getMessage()
            );
        }
    }
}