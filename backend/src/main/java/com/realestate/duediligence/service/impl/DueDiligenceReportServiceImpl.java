// backend/src/main/java/com/realestate/duediligence/service/impl/DueDiligenceReportServiceImpl.java
package com.realestate.duediligence.service.impl;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.GenerateReportRequest;
import com.realestate.duediligence.dto.ReportSectionDto;
import com.realestate.duediligence.dto.ReportSummaryDto;
import com.realestate.duediligence.entity.DueDiligenceReport;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.ReportSection;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.ReportStatus;
import com.realestate.duediligence.repository.DueDiligenceReportRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.ReportSectionRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.DueDiligenceReportService;

import lombok.RequiredArgsConstructor;

/**
 * Report generation orchestrator.
 *
 * Responsibilities:
 *   - Create the report shell (PENDING) synchronously
 *   - Enforce idempotency (avoid duplicate in-flight reports)
 *   - Dispatch async generation to ReportGenerationExecutor
 *   - Handle CRUD operations (list, get, delete, regenerate)
 *   - Enforce ownership (users see their own, admins see all)
 *
 * Async generation itself lives in ReportGenerationExecutor to avoid
 * Spring's @Async self-invocation proxy bypass bug.
 *
 * FIX (Session 23):
 *   executor.execute() is now dispatched inside TransactionSynchronization
 *   .afterCommit() to guarantee the PENDING report row is visible in the
 *   database before the async worker attempts to read it.
 */
@Service
@RequiredArgsConstructor
public class DueDiligenceReportServiceImpl implements DueDiligenceReportService {

    private static final Logger log = LoggerFactory.getLogger(DueDiligenceReportServiceImpl.class);

    // Idempotency: don't create duplicate reports within this window
    private static final long IDEMPOTENCY_WINDOW_SECONDS = 60;

    private final DueDiligenceReportRepository reportRepository;
    private final ReportSectionRepository sectionRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final ReportGenerationExecutor executor;

    // ══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public DueDiligenceReportResponse generate(GenerateReportRequest request) {
        User user = requireCurrentUser();
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException(
                        "Property not found: " + request.getPropertyId()));

        // Idempotency check — return in-flight report if it exists
        Optional<DueDiligenceReport> recent = findRecentInFlightReport(
                user.getId(), property.getId());
        if (recent.isPresent()) {
            log.info("Idempotency: returning in-flight report {} for property {}",
                    recent.get().getId(), property.getId());
            return toFullResponse(recent.get(), List.of());
        }

        // Determine next version number
        Integer maxVersion = reportRepository.findMaxVersionByPropertyId(property.getId());
        int nextVersion = (maxVersion != null ? maxVersion : 0) + 1;

        // Auto-generate title if not provided
        String title = request.getTitle();
        if (title == null || title.isBlank()) {
            title = String.format("Due Diligence Report - %s - v%d",
                    property.getAddress(), nextVersion);
        }

        // Create PENDING report shell (synchronous)
        DueDiligenceReport report = DueDiligenceReport.builder()
                .property(property)
                .generatedBy(user)
                .title(title)
                .status(ReportStatus.PENDING)
                .version(nextVersion)
                .build();

        DueDiligenceReport saved = reportRepository.save(report);
        log.info("Report {} created (PENDING) for property {} by user {}",
                saved.getId(), property.getId(), user.getEmail());

        // ── SESSION 23 FIX ────────────────────────────────────────────────────────
        //
        // ROOT CAUSE OF BUG:
        //   Calling executor.execute() HERE (inside the @Transactional boundary)
        //   causes the async thread to start a new transaction (REQUIRES_NEW)
        //   before THIS transaction commits. The async thread calls findById()
        //   on a row that hasn't been committed yet → gets null → logs "Report
        //   vanished" → exits → status stays PENDING forever.
        //
        // THE FIX:
        //   Register a TransactionSynchronization callback. Spring will invoke
        //   afterCommit() after this transaction has fully committed to the DB.
        //   Only then does the async worker start — at which point the report
        //   row is guaranteed visible to all new transactions.
        //
        // THREAD SAFETY:
        //   afterCommit() still runs on THIS HTTP thread, but the executor
        //   call immediately hands off work to the reportTaskExecutor pool.
        //   This method returns toFullResponse() before executor finishes,
        //   exactly as before.
        //
        // CAPTURES (effectively-final for lambda):
        //   savedId and forceRecalc are primitives/longs captured safely.
        // ─────────────────────────────────────────────────────────────────────────
        final Long savedId = saved.getId();
        final boolean forceRecalc = Boolean.TRUE.equals(request.getForceRiskRecalculation());

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        log.info("Report {} transaction committed — dispatching async generation",
                                savedId);
                        executor.execute(savedId, forceRecalc);
                    }
                }
        );

        return toFullResponse(saved, List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public ReportStatus getStatus(Long reportId) {
        DueDiligenceReport report = findAndAuthorize(reportId);
        return report.getStatus();
    }

    @Override
    @Transactional(readOnly = true)
    public DueDiligenceReportResponse getReport(Long reportId) {
        DueDiligenceReport report = findAndAuthorize(reportId);
        List<ReportSection> sections = sectionRepository
                .findByReportIdOrderByOrderIndexAsc(reportId);
        return toFullResponse(report, sections);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportSummaryDto> list(Pageable pageable) {
        User user = requireCurrentUser();
        boolean isAdmin = isAdmin(user);

        Page<DueDiligenceReport> page = isAdmin
                ? reportRepository.findAllByOrderByCreatedAtDesc(pageable)
                : reportRepository.findByGeneratedByIdOrderByCreatedAtDesc(
                        user.getId(), pageable);

        return page.map(this::toSummaryDto);
    }

    @Override
    @Transactional
    public void delete(Long reportId) {
        DueDiligenceReport report = findAndAuthorize(reportId);
        log.info("Deleting report {} (property {})", reportId,
                report.getProperty() != null ? report.getProperty().getId() : "?");
        reportRepository.delete(report);
    }

    @Override
    @Transactional
    public DueDiligenceReportResponse regenerate(Long reportId) {
        DueDiligenceReport original = findAndAuthorize(reportId);
        log.info("Regenerate requested for report {} — creating new version", reportId);

        // NOTE (Session 23):
        // regenerate() is @Transactional (REQUIRED). It calls generate() which is
        // also @Transactional (REQUIRED). They SHARE the same transaction.
        // The afterCommit() callback registered inside generate() fires when
        // THIS (regenerate's) transaction commits — which is correct, because the
        // new report row commits with it. No changes needed here.
        GenerateReportRequest req = GenerateReportRequest.builder()
                .propertyId(original.getProperty().getId())
                .title(null)                    // auto-title with new version
                .forceRiskRecalculation(true)   // regenerate always uses fresh data
                .build();

        return generate(req);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportSummaryDto> getReportsForProperty(Long propertyId) {
        User user = requireCurrentUser();
        boolean isAdmin = isAdmin(user);

        List<DueDiligenceReport> reports = reportRepository
                .findByPropertyIdOrderByVersionDesc(propertyId);

        return reports.stream()
                .filter(r -> isAdmin ||
                        (r.getGeneratedBy() != null &&
                         r.getGeneratedBy().getId().equals(user.getId())))
                .map(this::toSummaryDto)
                .collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════

    private User requireCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new RuntimeException("Authentication required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException(
                        "Authenticated user not found: " + auth.getName()));
    }

    private boolean isAdmin(User user) {
        return user != null && user.getRole() != null
                && "ADMIN".equals(user.getRole().getRoleName().name());
    }

    private DueDiligenceReport findAndAuthorize(Long reportId) {
        DueDiligenceReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));

        User user = requireCurrentUser();

        // ── TEMPORARY DEBUG LOGGING ──────────────────────────────────
        String roleName = (user.getRole() != null && user.getRole().getRoleName() != null)
                ? user.getRole().getRoleName().name() : "NULL";
        boolean admin = isAdmin(user);
        Long ownerId = report.getGeneratedBy() != null ? report.getGeneratedBy().getId() : null;
        String ownerEmail = report.getGeneratedBy() != null ? report.getGeneratedBy().getEmail() : "NULL";

        log.info("[AUTHZ-DEBUG] reportId={} | userId={} | userEmail={} | role={} | isAdmin={} | ownerId={} | ownerEmail={} | isOwner={}",
                reportId,
                user.getId(),
                user.getEmail(),
                roleName,
                admin,
                ownerId,
                ownerEmail,
                ownerId != null && ownerId.equals(user.getId()));
        // ── END DEBUG ────────────────────────────────────────────────

        if (!admin &&
                (report.getGeneratedBy() == null ||
                 !report.getGeneratedBy().getId().equals(user.getId()))) {
            log.warn("[AUTHZ-DEBUG] ACCESS DENIED: reportId={} userId={} role={} isAdmin={} ownerId={}",
                    reportId, user.getId(), roleName, admin, ownerId);
            throw new RuntimeException("Report not found: " + reportId);
        }
        return report;
    }

    private Optional<DueDiligenceReport> findRecentInFlightReport(
            Long userId, Long propertyId) {
        LocalDateTime cutoff = LocalDateTime.now()
                .minusSeconds(IDEMPOTENCY_WINDOW_SECONDS);
        return reportRepository.findByPropertyIdOrderByVersionDesc(propertyId).stream()
                .filter(r -> r.getGeneratedBy() != null &&
                        r.getGeneratedBy().getId().equals(userId))
                .filter(r -> r.getStatus() == ReportStatus.PENDING ||
                        r.getStatus() == ReportStatus.GENERATING)
                .filter(r -> r.getCreatedAt() != null &&
                        r.getCreatedAt().isAfter(cutoff))
                .findFirst();
    }

    private Instant toInstant(LocalDateTime ldt) {
        return ldt != null ? ldt.toInstant(ZoneOffset.UTC) : null;
    }

    // ── DTO mappers ───────────────────────────────────────────────

    private DueDiligenceReportResponse toFullResponse(DueDiligenceReport report,
                                                      List<ReportSection> sections) {
        List<ReportSectionDto> sectionDtos = sections.stream()
                .map(this::toSectionDto)
                .collect(Collectors.toList());

        return DueDiligenceReportResponse.builder()
                .id(report.getId())
                .propertyId(report.getProperty() != null
                        ? report.getProperty().getId() : null)
                .propertyAddress(report.getProperty() != null
                        ? report.getProperty().getAddress() : null)
                .title(report.getTitle())
                .status(report.getStatus())
                .version(report.getVersion())
                .riskScoreSnapshot(report.getRiskScoreSnapshot())
                .executiveSummary(report.getExecutiveSummary())
                .errorMessage(report.getErrorMessage())
                .sections(sectionDtos)
                .createdAt(toInstant(report.getCreatedAt()))
                .completedAt(toInstant(report.getCompletedAt()))
                .updatedAt(toInstant(report.getUpdatedAt()))
                .generatedByEmail(report.getGeneratedBy() != null
                        ? report.getGeneratedBy().getEmail() : null)
                .generatedByUserId(report.getGeneratedBy() != null
                        ? report.getGeneratedBy().getId() : null)
                .build();
    }

    private ReportSectionDto toSectionDto(ReportSection s) {
        return ReportSectionDto.builder()
                .id(s.getId())
                .sectionType(s.getSectionType())
                .title(s.getTitle())
                .orderIndex(s.getOrderIndex())
                .content(s.getContent())
                .dataJson(s.getDataJson())
                .createdAt(toInstant(s.getCreatedAt()))
                .build();
    }

    private ReportSummaryDto toSummaryDto(DueDiligenceReport r) {
        return ReportSummaryDto.builder()
                .id(r.getId())
                .propertyId(r.getProperty() != null ? r.getProperty().getId() : null)
                .propertyAddress(r.getProperty() != null
                        ? r.getProperty().getAddress() : null)
                .title(r.getTitle())
                .status(r.getStatus())
                .version(r.getVersion())
                .riskScoreSnapshot(r.getRiskScoreSnapshot())
                .errorMessage(r.getErrorMessage())
                .createdAt(toInstant(r.getCreatedAt()))
                .completedAt(toInstant(r.getCompletedAt()))
                .generatedByEmail(r.getGeneratedBy() != null
                        ? r.getGeneratedBy().getEmail() : null)
                .build();
    }
}