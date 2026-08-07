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
 * Spring's @Async only works when the method is called through the Spring proxy.
 * If DueDiligenceReportServiceImpl.generate() calls generateAsync() on itself,
 * the proxy is bypassed and @Async does nothing (executes synchronously).
 *
 * By putting the async method in a separate bean, injection ensures the proxy
 * is used properly and the method runs on the executor pool.
 */
@Component
@RequiredArgsConstructor
public class ReportGenerationExecutor {

    private static final Logger log = LoggerFactory.getLogger(ReportGenerationExecutor.class);

    private final DueDiligenceReportRepository reportRepository;
    private final ReportSectionRepository sectionRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final RiskAssessmentService riskAssessmentService;
    private final PropertyAggregationService aggregationService;
    private final ReportSectionBuilder sectionBuilder;
    private final NotificationService notificationService;
    private final NotificationEventListener notificationEventListener;

    /**
     * Executes report generation asynchronously.
     * Uses REQUIRES_NEW so the async transaction is independent of any caller's transaction.
     */
    @Async("reportTaskExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void execute(Long reportId, boolean forceRiskRecalculation) {

        log.info("[async] Starting report generation for report {}", reportId);
        long start = System.currentTimeMillis();

        DueDiligenceReport report = reportRepository.findById(reportId).orElse(null);
        if (report == null) {
            log.error("[async] Report {} vanished before generation started", reportId);
            return;
        }

        try {
            // Mark GENERATING (visible to polling clients immediately)
            report.setStatus(ReportStatus.GENERATING);
            reportRepository.save(report);
            reportRepository.flush();

            Long propertyId = report.getProperty().getId();

            // 1. Ensure a risk assessment exists
            if (forceRiskRecalculation) {
                riskAssessmentService.recalculate(propertyId);
            } else {
                riskAssessmentService.getOrCompute(propertyId);
            }

            RiskAssessment assessment = riskAssessmentRepository
                    .findByPropertyIdAndIsLatestTrue(propertyId)
                    .orElseThrow(() -> new RuntimeException(
                            "Risk assessment missing after compute for property " + propertyId));

            // 2. Fetch aggregated property data + risk breakdown
            AggregatedPropertyResponse agg = aggregationService.aggregate(propertyId);
            RiskBreakdownDto breakdown = riskAssessmentService.getBreakdown(propertyId);

            // 3. Build & persist all 8 sections
            List<ReportSection> sections = sectionBuilder.buildAll(report, agg, assessment, breakdown);
            sectionRepository.saveAll(sections);

            // 4. Finalize report metadata
            report.setRiskAssessmentSnapshot(assessment);
            report.setRiskScoreSnapshot(assessment.getOverallScore());
            report.setExecutiveSummary(assessment.getSummary());
            report.setStatus(ReportStatus.COMPLETED);
            report.setCompletedAt(LocalDateTime.now());
            reportRepository.save(report);

            long duration = System.currentTimeMillis() - start;
            log.info("[async] Report {} COMPLETED in {}ms — {} sections generated",
                    reportId, duration, sections.size());

            // 5. Fire notification (in-app + email) — non-blocking, separate transaction
            fireCompletionNotification(report);

        } catch (Exception e) {
            log.error("[async] Report {} generation FAILED: {}", reportId, e.getMessage(), e);
            markFailed(reportId, e.getMessage());
        }
    }

    /**
     * Persists FAILED status in its own transaction so it survives even if
     * the enclosing async transaction was rolled back by the exception.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void markFailed(Long reportId, String errorMessage) {
        try {
            DueDiligenceReport failed = reportRepository.findById(reportId).orElse(null);
            if (failed != null) {
                failed.setStatus(ReportStatus.FAILED);
                failed.setErrorMessage(truncate(errorMessage, 500));
                reportRepository.save(failed);
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
     * Runs inside the same async transaction — failures are logged, not propagated.
     */
    private void fireCompletionNotification(DueDiligenceReport report) {
        try {
            User owner = report.getGeneratedBy();
            if (owner == null) return;

            String propertyAddress = report.getProperty() != null
                    ? report.getProperty().getAddress() : "Unknown property";
            String reportTitle = report.getTitle();
            String redirectUrl = "/reports/" + report.getId();

            // In-app notification (respects preferences internally)
            notificationService.createForUser(
                    owner,
                    NotificationType.REPORT_READY,
                    "Your report is ready",
                    "Due diligence report for " + propertyAddress + " has been generated.",
                    redirectUrl
            );

            // Email notification (respects preferences internally)
            notificationEventListener.onReportReady(owner, reportTitle, propertyAddress, report.getId());

        } catch (Exception e) {
            log.warn("[async] Failed to fire completion notification for report {}: {}",
                    report.getId(), e.getMessage());
        }
    }
}