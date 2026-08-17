package com.realestate.duediligence.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.realestate.duediligence.entity.Property;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    // ────────────────────────────────────────────────────────────────
    // Search
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
    // Portfolio insights
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT COALESCE(SUM(p.marketValue), 0) " +
           "FROM Property p " +
           "WHERE p.marketValue IS NOT NULL")
    double sumMarketValue();

    @Query("SELECT COALESCE(AVG(p.marketValue), 0) " +
           "FROM Property p " +
           "WHERE p.marketValue IS NOT NULL")
    double averageMarketValue();

    @Query("SELECT p FROM Property p " +
           "WHERE p.marketValue IS NOT NULL " +
           "ORDER BY p.marketValue DESC")
    List<Property> findTopByMarketValue();

    @Query("SELECT COUNT(DISTINCT p.city) " +
           "FROM Property p " +
           "WHERE p.city IS NOT NULL")
    long countDistinctCities();

    @Query("SELECT p.propertyType, COUNT(p), " +
           "COALESCE(SUM(p.marketValue), 0) " +
           "FROM Property p " +
           "GROUP BY p.propertyType " +
           "ORDER BY COUNT(p) DESC")
    List<Object[]> aggregateByType();

    @Query("SELECT p.city, COUNT(p) " +
           "FROM Property p " +
           "WHERE p.city IS NOT NULL " +
           "GROUP BY p.city " +
           "ORDER BY COUNT(p) DESC")
    List<Object[]> aggregateByCity();

    // ────────────────────────────────────────────────────────────────
    // Trends
    // ────────────────────────────────────────────────────────────────

    long countByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end);

    long countByVerifiedTrueAndUpdatedAtBetween(
            LocalDateTime start,
            LocalDateTime end);

    // ────────────────────────────────────────────────────────────────
    // Activity feed
    //
    // JOIN FETCH prevents the N+1 problem when DashboardServiceImpl
    // accesses p.getCreatedBy().getFullName()/getEmail().
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT p FROM Property p " +
           "JOIN FETCH p.createdBy " +
           "ORDER BY p.updatedAt DESC")
    List<Property> findTop30ByOrderByUpdatedAtDesc();

    // ────────────────────────────────────────────────────────────────
    // Per-user snapshot queries
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT COALESCE(SUM(p.marketValue), 0) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.marketValue IS NOT NULL")
    Double sumMarketValueByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(p) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId")
    Integer countByCreatedById(@Param("userId") Long userId);

    @Query("SELECT COUNT(p) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.verified = true")
    Integer countVerifiedByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT p.city) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.city IS NOT NULL")
    Integer countDistinctCitiesByUser(@Param("userId") Long userId);

    @Query("SELECT p FROM Property p " +
           "WHERE p.latitude IS NOT NULL " +
           "AND p.longitude IS NOT NULL")
    List<Property> findAllWithCoordinates();

    // ────────────────────────────────────────────────────────────────
    // Per-user filtered queries
    // ────────────────────────────────────────────────────────────────

    List<Property> findByCreatedById(Long userId);

    List<Property> findTop5ByCreatedByIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT p FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND (" +
           "LOWER(p.address)      LIKE %:q% OR " +
           "LOWER(p.city)         LIKE %:q% OR " +
           "LOWER(p.state)        LIKE %:q% OR " +
           "LOWER(p.zipCode)      LIKE %:q% OR " +
           "LOWER(p.propertyType) LIKE %:q%" +
           ")")
    List<Property> searchByKeywordAndUser(
            @Param("q") String q,
            @Param("userId") Long userId);

    @Query("SELECT p FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.latitude IS NOT NULL " +
           "AND p.longitude IS NOT NULL")
    List<Property> findAllWithCoordinatesByUser(
            @Param("userId") Long userId);

    // ────────────────────────────────────────────────────────────────
    // Dashboard per-user queries
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT COUNT(p) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId")
    long countByCreatedByIdLong(@Param("userId") Long userId);

    @Query("SELECT COUNT(p) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.verified = true")
    long countVerifiedByUserLong(@Param("userId") Long userId);

    @Query("SELECT COUNT(p) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.verified = false")
    long countPendingByUserLong(@Param("userId") Long userId);

    @Query("SELECT COALESCE(AVG(p.marketValue), 0) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.marketValue IS NOT NULL")
    double averageMarketValueByUser(@Param("userId") Long userId);

    @Query("SELECT p FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.marketValue IS NOT NULL " +
           "ORDER BY p.marketValue DESC")
    List<Property> findTopByMarketValueForUser(
            @Param("userId") Long userId);

    @Query("SELECT p.propertyType, COUNT(p), " +
           "COALESCE(SUM(p.marketValue), 0) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "GROUP BY p.propertyType " +
           "ORDER BY COUNT(p) DESC")
    List<Object[]> aggregateByTypeForUser(
            @Param("userId") Long userId);

    @Query("SELECT p.city, COUNT(p) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.city IS NOT NULL " +
           "GROUP BY p.city " +
           "ORDER BY COUNT(p) DESC")
    List<Object[]> aggregateByCityForUser(
            @Param("userId") Long userId);

    // JOIN FETCH prevents N+1 when the activity feed accesses createdBy.
    @Query("SELECT p FROM Property p " +
           "JOIN FETCH p.createdBy " +
           "WHERE p.createdBy.id = :userId " +
           "ORDER BY p.updatedAt DESC")
    List<Property> findTop30ByCreatedByIdOrderByUpdatedAtDesc(
            @Param("userId") Long userId);

    long countByCreatedByIdAndCreatedAtBetween(
            Long userId,
            LocalDateTime start,
            LocalDateTime end);

    @Query("SELECT COUNT(p) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.verified = true " +
           "AND p.updatedAt BETWEEN :start AND :end")
    long countVerifiedByUserBetween(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // ────────────────────────────────────────────────────────────────
    // Dashboard recommendation count queries
    //
    // These queries move counting work from Java memory/streams
    // into the database.
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT COUNT(p) " +
           "FROM Property p " +
           "WHERE p.imageUrl IS NULL " +
           "OR TRIM(p.imageUrl) = ''")
    long countPropertiesWithoutPhoto();

    @Query("SELECT COUNT(p) " +
           "FROM Property p " +
           "WHERE p.area IS NULL " +
           "OR p.area <= 0")
    long countPropertiesWithoutArea();

    @Query("SELECT COUNT(DISTINCT p.city) " +
           "FROM Property p " +
           "WHERE p.city IS NOT NULL " +
           "AND TRIM(p.city) <> ''")
    long countDistinctCitiesForRecommendations();

    @Query("SELECT COUNT(p) " +
       "FROM Property p " +
       "WHERE p.verified = true")
    long countVerifiedPropertiesForRecommendations();

    @Query("SELECT COUNT(p) " +
       "FROM Property p " +
       "WHERE p.verified = false " +
       "OR p.verified IS NULL")
    long countPendingPropertiesForRecommendations();


    // ────────────────────────────────────────────────────────────────
    // Dashboard recommendation count queries - per user
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT COUNT(p) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND (p.imageUrl IS NULL OR TRIM(p.imageUrl) = '')")
    long countPropertiesWithoutPhotoByUser(
            @Param("userId") Long userId);

    @Query("SELECT COUNT(p) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND (p.area IS NULL OR p.area <= 0)")
    long countPropertiesWithoutAreaByUser(
            @Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT p.city) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.city IS NOT NULL " +
           "AND TRIM(p.city) <> ''")
    long countDistinctCitiesByUserForRecommendations(
            @Param("userId") Long userId);

    @Query("SELECT COUNT(p) " +
           "FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND p.verified = true")
    long countVerifiedPropertiesForRecommendationsByUser(
            @Param("userId") Long userId);

    @Query("SELECT COUNT(p) " +
       "FROM Property p " +
       "WHERE p.createdBy.id = :userId " +
       "AND (p.verified = false OR p.verified IS NULL)")
    long countPendingPropertiesByUser(
        @Param("userId") Long userId);

    // ────────────────────────────────────────────────────────────────
    // Recommendation target properties
    //
    // Pageable is used with PageRequest.of(0, 1), so only one
    // matching property is retrieved instead of loading all matches.
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT p FROM Property p " +
           "WHERE p.imageUrl IS NULL " +
           "OR TRIM(p.imageUrl) = '' " +
           "ORDER BY p.updatedAt DESC")
    List<Property> findPropertyWithoutPhoto(Pageable pageable);

    @Query("SELECT p FROM Property p " +
           "WHERE p.area IS NULL " +
           "OR p.area <= 0 " +
           "ORDER BY p.updatedAt DESC")
    List<Property> findPropertyWithoutArea(Pageable pageable);

    @Query("SELECT p FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND (p.imageUrl IS NULL OR TRIM(p.imageUrl) = '') " +
           "ORDER BY p.updatedAt DESC")
    List<Property> findPropertyWithoutPhotoByUser(
            @Param("userId") Long userId,
            Pageable pageable);

    @Query("SELECT p FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "AND (p.area IS NULL OR p.area <= 0) " +
           "ORDER BY p.updatedAt DESC")
    List<Property> findPropertyWithoutAreaByUser(
            @Param("userId") Long userId,
            Pageable pageable);

    // ────────────────────────────────────────────────────────────────
    // Most incomplete property
    //
    // The database calculates the number of missing fields and
    // returns only the highest-priority property through Pageable.
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT p FROM Property p " +
           "ORDER BY " +
           "(CASE WHEN p.address IS NULL OR LENGTH(TRIM(p.address)) <= 5 THEN 1 ELSE 0 END) + " +
           "(CASE WHEN p.city IS NULL OR TRIM(p.city) = '' THEN 1 ELSE 0 END) + " +
           "(CASE WHEN p.state IS NULL OR TRIM(p.state) = '' THEN 1 ELSE 0 END) + " +
           "(CASE WHEN p.zipCode IS NULL OR TRIM(p.zipCode) = '' THEN 1 ELSE 0 END) + " +
           "(CASE WHEN p.propertyType IS NULL OR TRIM(p.propertyType) = '' THEN 1 ELSE 0 END) + " +
           "(CASE WHEN p.marketValue IS NULL OR p.marketValue <= 0 THEN 1 ELSE 0 END) + " +
           "(CASE WHEN p.area IS NULL OR p.area <= 0 THEN 1 ELSE 0 END) DESC, " +
           "p.updatedAt DESC")
    List<Property> findMostIncompleteProperty(Pageable pageable);

    @Query("SELECT p FROM Property p " +
           "WHERE p.createdBy.id = :userId " +
           "ORDER BY " +
           "(CASE WHEN p.address IS NULL OR LENGTH(TRIM(p.address)) <= 5 THEN 1 ELSE 0 END) + " +
           "(CASE WHEN p.city IS NULL OR TRIM(p.city) = '' THEN 1 ELSE 0 END) + " +
           "(CASE WHEN p.state IS NULL OR TRIM(p.state) = '' THEN 1 ELSE 0 END) + " +
           "(CASE WHEN p.zipCode IS NULL OR TRIM(p.zipCode) = '' THEN 1 ELSE 0 END) + " +
           "(CASE WHEN p.propertyType IS NULL OR TRIM(p.propertyType) = '' THEN 1 ELSE 0 END) + " +
           "(CASE WHEN p.marketValue IS NULL OR p.marketValue <= 0 THEN 1 ELSE 0 END) + " +
           "(CASE WHEN p.area IS NULL OR p.area <= 0 THEN 1 ELSE 0 END) DESC, " +
           "p.updatedAt DESC")
    List<Property> findMostIncompletePropertyByUser(
            @Param("userId") Long userId,
            Pageable pageable);
}