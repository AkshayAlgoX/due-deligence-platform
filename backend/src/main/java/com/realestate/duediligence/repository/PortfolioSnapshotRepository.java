package com.realestate.duediligence.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.entity.PortfolioSnapshot;

@Repository
public interface PortfolioSnapshotRepository
        extends JpaRepository<PortfolioSnapshot, Long> {

    /**
     * All snapshots for a specific user, newest first.
     * Used for user-scoped trend charts.
     */
    List<PortfolioSnapshot> findByUserIdOrderBySnapshotDateAsc(Long userId);

    /**
     * Snapshots for a specific user within a date range (inclusive).
     * Used when the UI requests 7d / 30d / 90d windows.
     */
    @Query("""
            SELECT s FROM PortfolioSnapshot s
            WHERE s.user.id = :userId
              AND s.snapshotDate >= :from
              AND s.snapshotDate <= :to
            ORDER BY s.snapshotDate ASC
            """)
    List<PortfolioSnapshot> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    /**
     * Platform-wide snapshots (user IS NULL) within a date range.
     * Used for admin overview chart.
     */
    @Query("""
            SELECT s FROM PortfolioSnapshot s
            WHERE s.user IS NULL
              AND s.snapshotDate >= :from
              AND s.snapshotDate <= :to
            ORDER BY s.snapshotDate ASC
            """)
    List<PortfolioSnapshot> findPlatformSnapshotsInRange(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    /**
     * Check if a snapshot already exists for this user + date.
     * Used by the upsert pattern to avoid duplicates.
     */
    Optional<PortfolioSnapshot> findByUserIdAndSnapshotDate(
            Long userId, LocalDate snapshotDate);

    /**
     * Check if a platform-wide snapshot exists for this date.
     */
    @Query("""
            SELECT s FROM PortfolioSnapshot s
            WHERE s.user IS NULL
              AND s.snapshotDate = :date
            """)
    Optional<PortfolioSnapshot> findPlatformSnapshotByDate(
            @Param("date") LocalDate date);

    /**
     * Delete today's user snapshot before re-inserting (upsert).
     * Called every time a property changes so "today" stays accurate.
     */
    @Modifying
    @Transactional
    @Query("""
            DELETE FROM PortfolioSnapshot s
            WHERE s.user.id = :userId
              AND s.snapshotDate = :date
            """)
    void deleteByUserIdAndSnapshotDate(
            @Param("userId") Long userId,
            @Param("date") LocalDate date);

    /**
     * Delete today's platform snapshot before re-inserting.
     */
    @Modifying
    @Transactional
    @Query("""
            DELETE FROM PortfolioSnapshot s
            WHERE s.user IS NULL
              AND s.snapshotDate = :date
            """)
    void deletePlatformSnapshotByDate(@Param("date") LocalDate date);
}