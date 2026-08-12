package com.realestate.duediligence.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.realestate.duediligence.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // ────────────────────────────────────────────────────────────────
    // NEW — Trends
    // ────────────────────────────────────────────────────────────────

    /** New users created between two timestamps. */
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Users who created at least one property in the last N days.
     * "Active" = has recent activity, not just signed up.
     */
    @Query("SELECT COUNT(DISTINCT p.createdBy.id) FROM Property p " +
            "WHERE p.createdBy IS NOT NULL AND p.createdAt >= :since")
    long countActiveUsersSince(@Param("since") LocalDateTime since);
    // ────────────────────────────────────────────────────────────────
    // NEW — Admin Dashboard: activity heatmap (day-of-week × hour)
    // ────────────────────────────────────────────────────────────────

    @Query(value = "SELECT EXTRACT(DOW FROM created_at)::int AS day_of_week, " +
            "       EXTRACT(HOUR FROM created_at)::int AS hour_of_day, " +
            "       COUNT(*) AS activity_count " +
            "FROM users " +
            "GROUP BY day_of_week, hour_of_day " +
            "ORDER BY day_of_week, hour_of_day", nativeQuery = true)
    List<Object[]> getUserActivityHeatmapRaw();
    // ────────────────────────────────────────────────────────────────
    // NEW — Admin Dashboard: user management search/filter
    // ────────────────────────────────────────────────────────────────

    @Query("SELECT u FROM User u WHERE " +
            "(:search IS NULL OR LOWER(u.fullName) LIKE %:search% OR LOWER(u.email) LIKE %:search%) AND " +
            "(:roleName IS NULL OR u.role.roleName = :roleName)")
    org.springframework.data.domain.Page<User> searchUsers(
            @Param("search") String search,
            @Param("roleName") com.realestate.duediligence.enums.RoleType roleName,
            org.springframework.data.domain.Pageable pageable);
}