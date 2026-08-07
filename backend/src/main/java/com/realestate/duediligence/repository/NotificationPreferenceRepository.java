package com.realestate.duediligence.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.NotificationPreference;

/**
 * Repository for NotificationPreference entities.
 *
 * The service layer calls findByUserId first and falls back to
 * creating a default preference row if none exists.
 */
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    Optional<NotificationPreference> findByUserId(Long userId);
}
