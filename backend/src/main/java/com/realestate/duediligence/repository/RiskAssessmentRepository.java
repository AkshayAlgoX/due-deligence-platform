package com.realestate.duediligence.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.RiskAssessment;
import com.realestate.duediligence.enums.RiskLevel;

@Repository
public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {

    /** Get the currently active (latest) assessment for a property. */
    Optional<RiskAssessment> findByPropertyIdAndIsLatestTrue(Long propertyId);

    /** Full assessment history for a property (newest first). */
    List<RiskAssessment> findByPropertyIdOrderByCalculatedAtDesc(Long propertyId);

    /** Recent assessments (dashboard widget). */
    List<RiskAssessment> findTop10ByOrderByCalculatedAtDesc();

    /** Count of properties per risk level (admin analytics). */
    @Query("SELECT r.overallLevel, COUNT(r) FROM RiskAssessment r WHERE r.isLatest = true GROUP BY r.overallLevel")
    List<Object[]> countByLevelGrouped();

    /** Assessments in a date range (trend analysis). */
    List<RiskAssessment> findByCalculatedAtBetween(LocalDateTime start, LocalDateTime end);

    /** Mark previous assessments for a property as not-latest before saving new one. */
    @Modifying
    @Query("UPDATE RiskAssessment r SET r.isLatest = false WHERE r.property.id = :propertyId AND r.isLatest = true")
    int markPreviousAsNotLatest(@Param("propertyId") Long propertyId);

    /** Properties above a risk threshold — used for alerts. */
    @Query("SELECT r FROM RiskAssessment r WHERE r.isLatest = true AND r.overallLevel = :level")
    List<RiskAssessment> findAllByLatestLevel(@Param("level") RiskLevel level);

    boolean existsByPropertyIdAndIsLatestTrue(Long propertyId);
}