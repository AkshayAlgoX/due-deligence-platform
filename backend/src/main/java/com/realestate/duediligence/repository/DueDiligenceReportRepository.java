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
public interface DueDiligenceReportRepository extends JpaRepository<DueDiligenceReport, Long> {

    /** Paginated reports for a specific user. */
    Page<DueDiligenceReport> findByGeneratedByIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** All reports for a specific property (version history). */
    List<DueDiligenceReport> findByPropertyIdOrderByVersionDesc(Long propertyId);

    /** Latest report for a property. */
    Optional<DueDiligenceReport> findFirstByPropertyIdOrderByVersionDesc(Long propertyId);

    /** Public shared report lookup. */
    Optional<DueDiligenceReport> findByShareToken(String shareToken);

    /** All reports in a particular status (used by generator worker). */
    List<DueDiligenceReport> findByStatus(ReportStatus status);

    /** Latest version number for a property (used when creating new version). */
    @Query("SELECT COALESCE(MAX(r.version), 0) FROM DueDiligenceReport r WHERE r.property.id = :propertyId")
    Integer findMaxVersionByPropertyId(@Param("propertyId") Long propertyId);

    /** Count of reports generated per user (dashboard). */
    long countByGeneratedById(Long userId);

    /** Admin: all reports paginated. */
    Page<DueDiligenceReport> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // ── Admin analytics ──────────────────────────────────────────────────────

    /** Count of reports created within a date window (for stats / trend). */
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Daily report counts within a window.
     * Returns Object[]{ dateLabel (String yyyy-MM-dd), count (Long) }.
     */
    @Query(value =
        "SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS day, COUNT(*) " +
        "FROM due_diligence_reports " +
        "WHERE created_at >= :start AND created_at < :end " +
        "GROUP BY day ORDER BY day",
        nativeQuery = true)
    List<Object[]> countDailyBetween(
        @Param("start") LocalDateTime start,
        @Param("end")   LocalDateTime end);

    /**
     * Weekly report counts within a window.
     * Returns Object[]{ weekLabel (String yyyy-'W'ww), count (Long) }.
     */
    @Query(value =
        "SELECT TO_CHAR(created_at, 'IYYY-\"W\"IW') AS week, COUNT(*) " +
        "FROM due_diligence_reports " +
        "WHERE created_at >= :start AND created_at < :end " +
        "GROUP BY week ORDER BY week",
        nativeQuery = true)
    List<Object[]> countWeeklyBetween(
        @Param("start") LocalDateTime start,
        @Param("end")   LocalDateTime end);
}