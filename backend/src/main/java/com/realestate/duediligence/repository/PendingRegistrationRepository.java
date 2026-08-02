package com.realestate.duediligence.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.PendingRegistration;

import jakarta.transaction.Transactional;

@Repository
public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, Long> {

    Optional<PendingRegistration> findByEmail(String email);

    boolean existsByEmail(String email);

    @Modifying
    @Transactional
    void deleteByEmail(String email);

    /**
     * Deletes all pending registrations older than the cutoff.
     * Called by the scheduled cleanup job.
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM PendingRegistration p WHERE p.createdAt < :cutoff")
    int deleteExpiredBefore(@Param("cutoff") LocalDateTime cutoff);
}