package com.realestate.duediligence.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.realestate.duediligence.entity.Property;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    // ────────────────────────────────────────────────────────────────
    // Existing queries (unchanged)
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT p FROM Property p WHERE " +
           "LOWER(p.address)      LIKE %:q% OR " +
           "LOWER(p.city)         LIKE %:q% OR " +
           "LOWER(p.state)        LIKE %:q% OR " +
           "LOWER(p.zipCode)      LIKE %:q% OR " +
           "LOWER(p.propertyType) LIKE %:q%")
    List<Property> searchByKeyword(@Param("q") String q);

    List<Property> findTop5ByOrderByCreatedAtDesc();

    long countByVerifiedTrue();

    long countByVerifiedFalse();

    // ────────────────────────────────────────────────────────────────
    // NEW — Portfolio insights
    // ────────────────────────────────────────────────────────────────

    /** Sum of market values (COALESCE handles nulls). */
    @Query("SELECT COALESCE(SUM(p.marketValue), 0) FROM Property p WHERE p.marketValue IS NOT NULL")
    double sumMarketValue();

    /** Average of non-null market values (COALESCE avoids NaN when empty). */
    @Query("SELECT COALESCE(AVG(p.marketValue), 0) FROM Property p WHERE p.marketValue IS NOT NULL")
    double averageMarketValue();

    /** Top property by market value. Returns list — take first in service. */
    @Query("SELECT p FROM Property p WHERE p.marketValue IS NOT NULL ORDER BY p.marketValue DESC")
    List<Property> findTopByMarketValue();

    /** Distinct city count. */
    @Query("SELECT COUNT(DISTINCT p.city) FROM Property p WHERE p.city IS NOT NULL")
    long countDistinctCities();

    /**
     * Property type distribution: [propertyType, count, totalValue].
     * Nulls in propertyType are grouped under "Unknown" in service.
     */
    @Query("SELECT p.propertyType, COUNT(p), COALESCE(SUM(p.marketValue), 0) " +
           "FROM Property p " +
           "GROUP BY p.propertyType " +
           "ORDER BY COUNT(p) DESC")
    List<Object[]> aggregateByType();

    /**
     * City distribution: [city, count].
     * Limited to top 10 in service.
     */
    @Query("SELECT p.city, COUNT(p) " +
           "FROM Property p " +
           "WHERE p.city IS NOT NULL " +
           "GROUP BY p.city " +
           "ORDER BY COUNT(p) DESC")
    List<Object[]> aggregateByCity();

    // ────────────────────────────────────────────────────────────────
    // NEW — Trends (week-over-week)
    // ────────────────────────────────────────────────────────────────

    /** Properties created between two timestamps. */
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /** Verified properties updated between two timestamps (proxy for "became verified"). */
    long countByVerifiedTrueAndUpdatedAtBetween(LocalDateTime start, LocalDateTime end);

    // ────────────────────────────────────────────────────────────────
    // NEW — Activity feed source
    // ────────────────────────────────────────────────────────────────

    /**
     * Recently-updated properties (for activity feed).
     * We take a larger window (30) then classify in service:
     *   - createdAt == updatedAt  → PROPERTY_ADDED
     *   - createdAt != updatedAt  → PROPERTY_UPDATED
     *   - verified == true        → PROPERTY_VERIFIED (if updated recently)
     */
    List<Property> findTop30ByOrderByUpdatedAtDesc();
    // ────────────────────────────────────────────────────────────────
// NEW — Per-user snapshot queries
// ────────────────────────────────────────────────────────────────

/** Sum of market values for a specific user's properties. */
@Query("SELECT COALESCE(SUM(p.marketValue), 0) FROM Property p " +
       "WHERE p.createdBy.id = :userId AND p.marketValue IS NOT NULL")
Double sumMarketValueByUser(@Param("userId") Long userId);

/** Count of properties owned by a specific user. */
@Query("SELECT COUNT(p) FROM Property p WHERE p.createdBy.id = :userId")
Integer countByCreatedById(@Param("userId") Long userId);

/** Count of verified properties owned by a specific user. */
@Query("SELECT COUNT(p) FROM Property p " +
       "WHERE p.createdBy.id = :userId AND p.verified = true")
Integer countVerifiedByUser(@Param("userId") Long userId);

/** Distinct city count for a specific user's properties. */
@Query("SELECT COUNT(DISTINCT p.city) FROM Property p " +
       "WHERE p.createdBy.id = :userId AND p.city IS NOT NULL")
Integer countDistinctCitiesByUser(@Param("userId") Long userId);

/**
 * Fetch all properties that have coordinates set (for map view).
 * Excludes properties without lat/lon so map markers only show real data.
 */
@Query("SELECT p FROM Property p " +
       "WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL")
List<Property> findAllWithCoordinates();

    // ────────────────────────────────────────────────────────────────
    // NEW — Per-user filtered queries (data isolation)
    // ────────────────────────────────────────────────────────────────

    List<Property> findByCreatedById(Long userId);

    List<Property> findTop5ByCreatedByIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT p FROM Property p WHERE p.createdBy.id = :userId AND (" +
           "LOWER(p.address)      LIKE %:q% OR " +
           "LOWER(p.city)         LIKE %:q% OR " +
           "LOWER(p.state)        LIKE %:q% OR " +
           "LOWER(p.zipCode)      LIKE %:q% OR " +
           "LOWER(p.propertyType) LIKE %:q%)")
    List<Property> searchByKeywordAndUser(@Param("q") String q, @Param("userId") Long userId);

    @Query("SELECT p FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL")
    List<Property> findAllWithCoordinatesByUser(@Param("userId") Long userId);

    // ────────────────────────────────────────────────────────────────
    // Dashboard: per-user filtered queries
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT COUNT(p) FROM Property p WHERE p.createdBy.id = :userId")
long countByCreatedByIdLong(@Param("userId") Long userId);

    @Query("SELECT COUNT(p) FROM Property p WHERE p.createdBy.id = :userId AND p.verified = true")
    long countVerifiedByUserLong(@Param("userId") Long userId);

    @Query("SELECT COUNT(p) FROM Property p WHERE p.createdBy.id = :userId AND p.verified = false")
    long countPendingByUserLong(@Param("userId") Long userId);

    @Query("SELECT COALESCE(AVG(p.marketValue), 0) FROM Property p " +
           "WHERE p.createdBy.id = :userId AND p.marketValue IS NOT NULL")
    double averageMarketValueByUser(@Param("userId") Long userId);

    @Query("SELECT p FROM Property p WHERE p.createdBy.id = :userId " +
           "AND p.marketValue IS NOT NULL ORDER BY p.marketValue DESC")
    List<Property> findTopByMarketValueForUser(@Param("userId") Long userId);

    @Query("SELECT p.propertyType, COUNT(p), COALESCE(SUM(p.marketValue), 0) " +
           "FROM Property p WHERE p.createdBy.id = :userId " +
           "GROUP BY p.propertyType ORDER BY COUNT(p) DESC")
    List<Object[]> aggregateByTypeForUser(@Param("userId") Long userId);

    @Query("SELECT p.city, COUNT(p) FROM Property p " +
           "WHERE p.createdBy.id = :userId AND p.city IS NOT NULL " +
           "GROUP BY p.city ORDER BY COUNT(p) DESC")
    List<Object[]> aggregateByCityForUser(@Param("userId") Long userId);

    List<Property> findTop30ByCreatedByIdOrderByUpdatedAtDesc(Long userId);

    long countByCreatedByIdAndCreatedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(p) FROM Property p WHERE p.createdBy.id = :userId " +
           "AND p.verified = true AND p.updatedAt BETWEEN :start AND :end")
    long countVerifiedByUserBetween(@Param("userId") Long userId,
                                    @Param("start") LocalDateTime start,
                                    @Param("end") LocalDateTime end);
}
