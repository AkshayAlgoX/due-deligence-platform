// backend/src/main/java/com/realestate/duediligence/controller/ReportController.java
package com.realestate.duediligence.controller;

import java.util.List;
import java.util.Map;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.GenerateReportRequest;
import com.realestate.duediligence.dto.ReportSummaryDto;
import com.realestate.duediligence.enums.ReportStatus;
import com.realestate.duediligence.enums.AuditAction;
import com.realestate.duediligence.service.DueDiligenceReportService;
import com.realestate.duediligence.service.AuditLogService;
import com.realestate.duediligence.entity.AuditLog;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Due Diligence Report REST API.
 *
 * All endpoints require authentication (JWT).
 * Access control enforced in service layer:
 *   - Users see only their own reports
 *   - Admins see all reports
 *
 * Endpoints:
 *   POST   /api/reports/generate                → kick off async report generation
 *   GET    /api/reports/{reportId}/status       → poll status
 *   GET    /api/reports/{reportId}              → full report with all sections
 *   GET    /api/reports                         → paginated list of user's reports
 *   DELETE /api/reports/{reportId}              → delete a report
 *   GET    /api/reports/property/{propertyId}   → all reports for a property
 *   POST   /api/reports/{reportId}/regenerate   → create new report version
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Due Diligence Reports",
     description = "Multi-section property report generation with async processing")
public class ReportController {

    private static final Logger log = LoggerFactory.getLogger(ReportController.class);

    private final DueDiligenceReportService reportService;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    // ── POST /api/reports/generate ────────────────────────────────

    @PostMapping("/generate")
    @Operation(
            summary = "Generate a new due diligence report",
            description = "Creates a report in PENDING state and starts async generation. " +
                    "Returns immediately with the report shell — poll /status until COMPLETED. " +
                    "Idempotent: if a PENDING report exists for the same property within 60s, " +
                    "that report is returned instead of creating a duplicate.")
    public ResponseEntity<DueDiligenceReportResponse> generate(
            @Valid @RequestBody GenerateReportRequest request) {
        try {
            log.info("Report generation requested for property {}", request.getPropertyId());
            DueDiligenceReportResponse response = reportService.generate(request);

            User currentUser = resolveCurrentUser();

            saveAuditLog(
                     currentUser,
                     AuditAction.REPORT_GENERATED,
                     "REPORT",
                     response.getId(),
                     "Report generated");

            return ResponseEntity.status(202).body(response);   // 202 Accepted (async)
        } catch (RuntimeException e) {
            log.warn("Report generation failed: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ── GET /api/reports/{reportId}/status ────────────────────────

    @GetMapping("/{reportId}/status")
    @Operation(
            summary = "Get report generation status",
            description = "Lightweight status polling endpoint. " +
                    "Returns one of: PENDING, GENERATING, COMPLETED, FAILED, ARCHIVED. " +
                    "Frontend should poll every 2 seconds while status is PENDING or GENERATING.")
    public ResponseEntity<Map<String, Object>> getStatus(
            @Parameter(description = "Report ID", required = true)
            @PathVariable Long reportId) {
        try {
            ReportStatus status = reportService.getStatus(reportId);
            return ResponseEntity.ok(Map.of(
                    "reportId", reportId,
                    "status", status.name(),
                    "isTerminal", status == ReportStatus.COMPLETED ||
                            status == ReportStatus.FAILED
            ));
        } catch (RuntimeException e) {
            log.warn("Status check failed for report {}: {}", reportId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ── GET /api/reports/{reportId} ───────────────────────────────

    @GetMapping("/{reportId}")
    @Operation(
            summary = "Get full report with all sections",
            description = "Returns the complete report including all sections in display order. " +
                    "Only meaningful for COMPLETED reports — PENDING/GENERATING reports return " +
                    "empty section lists.")
    public ResponseEntity<DueDiligenceReportResponse> getReport(
            @Parameter(description = "Report ID", required = true)
            @PathVariable Long reportId) {
        try {
            return ResponseEntity.ok(reportService.getReport(reportId));
        } catch (RuntimeException e) {
            log.warn("Get report failed for {}: {}", reportId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ── GET /api/reports ──────────────────────────────────────────

    @GetMapping
    @Operation(
            summary = "List reports (paginated)",
            description = "Returns paginated list of the current user's reports, newest first. " +
                    "Admins receive all reports across all users.")
    public ResponseEntity<Page<ReportSummaryDto>> list(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field", example = "createdAt")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction", example = "desc")
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(reportService.list(pageable));
    }

    // ── DELETE /api/reports/{reportId} ────────────────────────────

    @DeleteMapping("/{reportId}")
    @Operation(
            summary = "Delete a report",
            description = "Permanently deletes a report and all its sections. " +
                    "Cascade deletes report_sections rows. Only owner or admin can delete.")
    public ResponseEntity<Void> delete(
            @Parameter(description = "Report ID", required = true)
            @PathVariable Long reportId) {
        try {
            reportService.delete(reportId);

            User currentUser = resolveCurrentUser();

            saveAuditLog(
                     currentUser,
                     AuditAction.REPORT_DELETED,
                    "REPORT",
                     reportId,
                     "Report deleted");

            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.warn("Delete report failed for {}: {}", reportId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ── GET /api/reports/property/{propertyId} ────────────────────

    @GetMapping("/property/{propertyId}")
    @Operation(
            summary = "Get all reports for a property",
            description = "Returns every report version generated for the given property, " +
                    "sorted by version descending (newest first). Useful for showing version history.")
    public ResponseEntity<List<ReportSummaryDto>> getReportsForProperty(
            @Parameter(description = "Property ID", required = true)
            @PathVariable Long propertyId) {
        try {
            return ResponseEntity.ok(reportService.getReportsForProperty(propertyId));
        } catch (RuntimeException e) {
            log.warn("Get reports for property {} failed: {}", propertyId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ── POST /api/reports/{reportId}/regenerate ───────────────────

    @PostMapping("/{reportId}/regenerate")
    @Operation(
            summary = "Regenerate a report",
            description = "Creates a NEW report (new ID, version+1) for the same property " +
                    "using current data. The original report is preserved for audit trail. " +
                    "Always forces a fresh risk recalculation before generating.")
    public ResponseEntity<DueDiligenceReportResponse> regenerate(
            @Parameter(description = "Report ID to regenerate", required = true)
            @PathVariable Long reportId) {
        try {
            log.info("Regenerate requested for report {}", reportId);
            DueDiligenceReportResponse response = reportService.regenerate(reportId);
            return ResponseEntity.status(202).body(response);
        } catch (RuntimeException e) {
            log.warn("Regenerate failed for report {}: {}", reportId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    private User resolveCurrentUser() {

    Authentication auth =
            SecurityContextHolder.getContext().getAuthentication();

    if (auth == null || !auth.isAuthenticated()) {
        return null;
    }

    return userRepository.findByEmail(auth.getName()).orElse(null);
}

private void saveAuditLog(
        User user,
        AuditAction action,
        String resourceType,
        Long resourceId,
        String details) {

    AuditLog log = new AuditLog();

    log.setUser(user);
    log.setAction(action);
    log.setResourceType(resourceType);
    log.setResourceId(resourceId);
    log.setDetailsJson(details);
    log.setCreatedAt(LocalDateTime.now());

    auditLogService.save(log);
}
}