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

    /**
     * Get the currently active/latest assessment for a property.
     *
     * JOIN FETCH prevents a lazy-load query when the service accesses
     * assessment.getProperty().
     */
    @Query("SELECT r FROM RiskAssessment r " +
           "JOIN FETCH r.property " +
           "WHERE r.property.id = :propertyId " +
           "AND r.isLatest = true")
    Optional<RiskAssessment> findByPropertyIdAndIsLatestTrue(
            @Param("propertyId") Long propertyId);

    /**
     * Full assessment history for a property.
     *
     * JOIN FETCH prevents N+1 property queries.
     */
    @Query("SELECT r FROM RiskAssessment r " +
           "JOIN FETCH r.property " +
           "WHERE r.property.id = :propertyId " +
           "ORDER BY r.calculatedAt DESC")
    List<RiskAssessment> findByPropertyIdOrderByCalculatedAtDesc(
            @Param("propertyId") Long propertyId);

    /**
     * Recent assessments.
     */
    @Query("SELECT r FROM RiskAssessment r " +
           "JOIN FETCH r.property " +
           "ORDER BY r.calculatedAt DESC")
    List<RiskAssessment> findTop10ByOrderByCalculatedAtDesc();

    /**
     * Count of latest assessments per risk level.
     *
     * This is an aggregate query, so JOIN FETCH is intentionally not used.
     */
    @Query("SELECT r.overallLevel, COUNT(r) " +
           "FROM RiskAssessment r " +
           "WHERE r.isLatest = true " +
           "GROUP BY r.overallLevel")
    List<Object[]> countByLevelGrouped();

    /**
     * Assessments in a date range.
     *
     * Property is fetched in the same query for callers that need it.
     */
    @Query("SELECT r FROM RiskAssessment r " +
           "JOIN FETCH r.property " +
           "WHERE r.calculatedAt BETWEEN :start AND :end " +
           "ORDER BY r.calculatedAt DESC")
    List<RiskAssessment> findByCalculatedAtBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    /**
     * Mark previous assessments for a property as not latest.
     */
    @Modifying
    @Query("UPDATE RiskAssessment r " +
           "SET r.isLatest = false " +
           "WHERE r.property.id = :propertyId " +
           "AND r.isLatest = true")
    int markPreviousAsNotLatest(
            @Param("propertyId") Long propertyId);

    /**
     * Find latest assessments at a particular risk level.
     */
    @Query("SELECT r FROM RiskAssessment r " +
           "JOIN FETCH r.property " +
           "WHERE r.isLatest = true " +
           "AND r.overallLevel = :level")
    List<RiskAssessment> findAllByLatestLevel(
            @Param("level") RiskLevel level);

    boolean existsByPropertyIdAndIsLatestTrue(Long propertyId);

    /**
     * Average overall score across active assessments.
     */
    @Query("SELECT COALESCE(AVG(r.overallScore), 0.0) " +
           "FROM RiskAssessment r " +
           "WHERE r.isLatest = true")
    Double avgOverallScore();
}