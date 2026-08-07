package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.realestate.duediligence.entity.Notification;
import com.realestate.duediligence.enums.NotificationType;

/**
 * Repository for Notification entities.
 *
 * All user-scoped queries include the userId predicate to ensure
 * data isolation — a user cannot ever see another user's notifications.
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Paginated notification history for a user, newest first.
     */
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Paginated unread-only notifications for a user.
     */
    Page<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Paginated notifications filtered by type.
     */
    Page<Notification> findByUserIdAndNotificationTypeOrderByCreatedAtDesc(
            Long userId, NotificationType type, Pageable pageable);

    /**
     * Count of unread notifications — drives the bell badge.
     */
    long countByUserIdAndIsReadFalse(Long userId);

    /**
     * Mark a single notification as read.
     * Returns number of rows updated (0 or 1).
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id AND n.user.id = :userId")
    int markAsRead(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * Mark ALL notifications for a user as read.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsRead(@Param("userId") Long userId);

    /**
     * Delete all notifications for a user (clear all).
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    /**
     * Latest N unread notifications for SSE bootstrap payload.
     */
    List<Notification> findTop10ByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
}
