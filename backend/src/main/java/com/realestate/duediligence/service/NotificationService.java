package com.realestate.duediligence.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.duediligence.dto.NotificationCountDto;
import com.realestate.duediligence.dto.NotificationDto;
import com.realestate.duediligence.dto.NotificationPreferenceDto;
import com.realestate.duediligence.dto.UpdatePreferencesRequest;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.NotificationType;

/**
 * Contract for the Notification System.
 *
 * All methods that operate on the authenticated user resolve
 * the user from the SecurityContext internally — callers do not
 * need to pass a userId for user-facing operations.
 *
 * The overloaded createForUser() variant accepts an explicit User
 * object so internal services (ReportGenerationExecutor) can create
 * notifications in async contexts where no SecurityContext is present.
 */
public interface NotificationService {

    // ── Creation ──────────────────────────────────────────────────

    /**
     * Create a notification for an explicit user.
     * Used by internal services (e.g. ReportGenerationExecutor).
     * Respects the user's in-app preference for the given type.
     * Fires SSE event if a live connection exists for the user.
     *
     * @param user          target user
     * @param type          notification type
     * @param title         short headline
     * @param message       full body
     * @param redirectUrl   optional deep-link (nullable)
     * @return the created NotificationDto, or null if in-app disabled
     */
    NotificationDto createForUser(User user, NotificationType type,
                                  String title, String message, String redirectUrl);

    // ── Queries ───────────────────────────────────────────────────

    /**
     * Paginated notification history for the authenticated user.
     * Pass unreadOnly=true to filter to unread-only.
     */
    Page<NotificationDto> getNotifications(Pageable pageable, boolean unreadOnly);

    /**
     * Paginated notifications filtered by type for the authenticated user.
     */
    Page<NotificationDto> getNotificationsByType(NotificationType type, Pageable pageable);

    /** Unread count for the authenticated user's bell badge. */
    NotificationCountDto getUnreadCount();

    // ── Mutations ─────────────────────────────────────────────────

    /** Mark a single notification as read. Enforces ownership. */
    void markAsRead(Long notificationId);

    /** Mark all notifications for the authenticated user as read. */
    void markAllAsRead();

    /** Delete a single notification. Enforces ownership. */
    void delete(Long notificationId);

    /** Delete all notifications for the authenticated user. */
    void clearAll();

    // ── Preferences ───────────────────────────────────────────────

    /** Get the authenticated user's preferences (creates defaults if missing). */
    NotificationPreferenceDto getPreferences();

    /** Update the authenticated user's preferences. */
    NotificationPreferenceDto updatePreferences(UpdatePreferencesRequest request);

    // ── Admin / Test ──────────────────────────────────────────────

    /**
     * Send a test notification to the authenticated user.
     * Useful for admin debugging and frontend integration testing.
     */
    NotificationDto sendTestNotification();

    /**
     * Broadcast a system notification to all users with systemInApp=true.
     * Admin-only; called from NotificationController with @PreAuthorize.
     *
     * @param title   notification headline
     * @param message notification body
     */
    void sendBulkSystemNotification(String title, String message);
}
