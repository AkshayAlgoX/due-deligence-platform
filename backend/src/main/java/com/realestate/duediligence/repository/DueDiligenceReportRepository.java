package com.realestate.duediligence.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.DueDiligenceReport;
import com.realestate.duediligence.enums.ReportStatus;

@Repository
public interface DueDiligenceReportRepository
        extends JpaRepository<DueDiligenceReport, Long> {

    // ────────────────────────────────────────────────────────────────
    // User reports
    // ────────────────────────────────────────────────────────────────

    @Query(
        value = "SELECT r FROM DueDiligenceReport r " +
                "JOIN FETCH r.property " +
                "JOIN FETCH r.generatedBy " +
                "WHERE r.generatedBy.id = :userId " +
                "ORDER BY r.createdAt DESC",
        countQuery = "SELECT COUNT(r) " +
                     "FROM DueDiligenceReport r " +
                     "WHERE r.generatedBy.id = :userId"
    )
    Page<DueDiligenceReport> findByGeneratedByIdOrderByCreatedAtDesc(
            @Param("userId") Long userId,
            Pageable pageable);

    // ────────────────────────────────────────────────────────────────
    // Property report history
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT r FROM DueDiligenceReport r " +
           "JOIN FETCH r.property " +
           "JOIN FETCH r.generatedBy " +
           "WHERE r.property.id = :propertyId " +
           "ORDER BY r.version DESC")
    List<DueDiligenceReport> findByPropertyIdOrderByVersionDesc(
            @Param("propertyId") Long propertyId);

    // ────────────────────────────────────────────────────────────────
    // Latest report
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT r FROM DueDiligenceReport r " +
           "JOIN FETCH r.property " +
           "JOIN FETCH r.generatedBy " +
           "WHERE r.property.id = :propertyId " +
           "ORDER BY r.version DESC")
    List<DueDiligenceReport> findLatestReportCandidates(
            @Param("propertyId") Long propertyId);

    /**
     * Convenience method retained for callers that only need the entity.
     */
    default Optional<DueDiligenceReport> findFirstByPropertyIdOrderByVersionDesc(
            Long propertyId) {

        return findLatestReportCandidates(propertyId)
                .stream()
                .findFirst();
    }

    // ────────────────────────────────────────────────────────────────
    // Public shared report
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT r FROM DueDiligenceReport r " +
           "JOIN FETCH r.property " +
           "JOIN FETCH r.generatedBy " +
           "WHERE r.shareToken = :shareToken")
    Optional<DueDiligenceReport> findByShareToken(
            @Param("shareToken") String shareToken);

    // ────────────────────────────────────────────────────────────────
    // Generator worker
    // ────────────────────────────────────────────────────────────────

    List<DueDiligenceReport> findByStatus(ReportStatus status);

    // ────────────────────────────────────────────────────────────────
    // Versioning
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT COALESCE(MAX(r.version), 0) " +
           "FROM DueDiligenceReport r " +
           "WHERE r.property.id = :propertyId")
    Integer findMaxVersionByPropertyId(
            @Param("propertyId") Long propertyId);

    // ────────────────────────────────────────────────────────────────
    // Dashboard
    // ────────────────────────────────────────────────────────────────

    long countByGeneratedById(Long userId);

    long countByGeneratedByIdAndCreatedAtAfter(
            Long userId,
            LocalDateTime since);

    // ────────────────────────────────────────────────────────────────
    // Admin
    // ────────────────────────────────────────────────────────────────

    @Query(
        value = "SELECT r FROM DueDiligenceReport r " +
                "JOIN FETCH r.property " +
                "JOIN FETCH r.generatedBy " +
                "ORDER BY r.createdAt DESC",
        countQuery = "SELECT COUNT(r) " +
                     "FROM DueDiligenceReport r"
    )
    Page<DueDiligenceReport> findAllByOrderByCreatedAtDesc(
            Pageable pageable);

    // ────────────────────────────────────────────────────────────────
    // Admin analytics
    // ────────────────────────────────────────────────────────────────

    long countByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end);

    @Query(
        value =
            "SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS day, COUNT(*) " +
            "FROM due_diligence_reports " +
            "WHERE created_at >= :start " +
            "AND created_at < :end " +
            "GROUP BY day " +
            "ORDER BY day",
        nativeQuery = true
    )
    List<Object[]> countDailyBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query(
        value =
            "SELECT TO_CHAR(created_at, 'IYYY-\"W\"IW') AS week, COUNT(*) " +
            "FROM due_diligence_reports " +
            "WHERE created_at >= :start " +
            "AND created_at < :end " +
            "GROUP BY week " +
            "ORDER BY week",
        nativeQuery = true
    )
    List<Object[]> countWeeklyBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}