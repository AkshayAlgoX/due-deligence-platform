package com.realestate.duediligence.repository;

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
}