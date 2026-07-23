package com.realestate.duediligence.repository;

import java.time.LocalDateTime;
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
}