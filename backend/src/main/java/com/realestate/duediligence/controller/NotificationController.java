package com.realestate.duediligence.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.NotificationCountDto;
import com.realestate.duediligence.dto.NotificationDto;
import com.realestate.duediligence.dto.NotificationPreferenceDto;
import com.realestate.duediligence.dto.UpdatePreferencesRequest;
import com.realestate.duediligence.enums.NotificationType;
import com.realestate.duediligence.service.NotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * Notification REST API.
 *
 * All endpoints require JWT authentication (inherited from SecurityConfig's
 * anyRequest().authenticated() rule).
 *
 * Endpoints:
 *   GET    /api/notifications                 → paginated history
 *   GET    /api/notifications/unread-count    → bell badge count
 *   PUT    /api/notifications/{id}/read       → mark one as read
 *   PUT    /api/notifications/mark-all-read   → mark all as read
 *   DELETE /api/notifications/{id}            → delete one
 *   DELETE /api/notifications/clear-all       → delete all
 *   GET    /api/notifications/preferences     → get preferences
 *   PUT    /api/notifications/preferences     → update preferences
 *   POST   /api/notifications/test            → send test (any user)
 *   POST   /api/notifications/send-bulk       → admin bulk broadcast
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification management with real-time SSE delivery")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationService notificationService;

    // ── GET /api/notifications ────────────────────────────────────

    @GetMapping
    @Operation(
            summary = "Get notifications (paginated)",
            description = "Returns the authenticated user's notification history, newest first. " +
                    "Pass unread=true to filter to unread-only. Pass type= to filter by notification type.")
    public ResponseEntity<Page<NotificationDto>> getNotifications(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20")
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Filter to unread only")
            @RequestParam(defaultValue = "false") boolean unread,
            @Parameter(description = "Filter by notification type")
            @RequestParam(required = false) NotificationType type) {

        Pageable pageable = PageRequest.of(page, size);

        if (type != null) {
            return ResponseEntity.ok(notificationService.getNotificationsByType(type, pageable));
        }
        return ResponseEntity.ok(notificationService.getNotifications(pageable, unread));
    }

    // ── GET /api/notifications/unread-count ───────────────────────

    @GetMapping("/unread-count")
    @Operation(
            summary = "Get unread notification count",
            description = "Lightweight endpoint for the bell badge. Call periodically or after SSE events.")
    public ResponseEntity<NotificationCountDto> getUnreadCount() {
        return ResponseEntity.ok(notificationService.getUnreadCount());
    }

    // ── PUT /api/notifications/{id}/read ─────────────────────────

    @PutMapping("/{id}/read")
    @Operation(
            summary = "Mark a notification as read",
            description = "Marks the notification with the given ID as read. " +
                    "Returns 404 if the notification doesn't exist or belongs to a different user.")
    public ResponseEntity<Void> markAsRead(
            @Parameter(description = "Notification ID", required = true)
            @PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.warn("markAsRead failed for notification {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ── PUT /api/notifications/mark-all-read ─────────────────────

    @PutMapping("/mark-all-read")
    @Operation(
            summary = "Mark all notifications as read",
            description = "Marks every unread notification for the authenticated user as read.")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("success", true, "message", "All notifications marked as read"));
    }

    // ── DELETE /api/notifications/{id} ───────────────────────────

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete a notification",
            description = "Permanently deletes a single notification. " +
                    "Returns 404 if not found or not owned by the authenticated user.")
    public ResponseEntity<Void> delete(
            @Parameter(description = "Notification ID", required = true)
            @PathVariable Long id) {
        try {
            notificationService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.warn("delete notification {} failed: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ── DELETE /api/notifications/clear-all ──────────────────────

    @DeleteMapping("/clear-all")
    @Operation(
            summary = "Clear all notifications",
            description = "Permanently deletes all notifications for the authenticated user.")
    public ResponseEntity<Map<String, Object>> clearAll() {
        notificationService.clearAll();
        return ResponseEntity.ok(Map.of("success", true, "message", "All notifications cleared"));
    }

    // ── GET /api/notifications/preferences ───────────────────────

    @GetMapping("/preferences")
    @Operation(
            summary = "Get notification preferences",
            description = "Returns the authenticated user's preference matrix. " +
                    "Creates default preferences if none exist.")
    public ResponseEntity<NotificationPreferenceDto> getPreferences() {
        return ResponseEntity.ok(notificationService.getPreferences());
    }

    // ── PUT /api/notifications/preferences ───────────────────────

    @PutMapping("/preferences")
    @Operation(
            summary = "Update notification preferences",
            description = "Persists the user's notification preference toggles. " +
                    "Subsequent notifications will respect the new settings immediately.")
    public ResponseEntity<NotificationPreferenceDto> updatePreferences(
            @RequestBody UpdatePreferencesRequest request) {
        return ResponseEntity.ok(notificationService.updatePreferences(request));
    }

    // ── POST /api/notifications/test ─────────────────────────────

    @PostMapping("/test")
    @Operation(
            summary = "Send test notification",
            description = "Creates a SYSTEM test notification for the authenticated user. " +
                    "Useful for verifying SSE connections and notification display.")
    public ResponseEntity<NotificationDto> sendTest() {
        NotificationDto result = notificationService.sendTestNotification();
        if (result == null) {
            return ResponseEntity.ok().build(); // preference disabled
        }
        return ResponseEntity.ok(result);
    }

    // ── POST /api/notifications/send-bulk ────────────────────────

    @PostMapping("/send-bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Send bulk system notification (Admin only)",
            description = "Broadcasts a SYSTEM notification to all users with systemInApp=true. " +
                    "Only accessible by ADMIN role.")
    public ResponseEntity<Map<String, Object>> sendBulk(
            @RequestBody Map<String, String> body) {
        String title = body.getOrDefault("title", "System Notification");
        String message = body.getOrDefault("message", "A system update is available.");

        if (title.isBlank() || message.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "title and message are required"));
        }

        notificationService.sendBulkSystemNotification(title, message);
        return ResponseEntity.ok(Map.of("success", true, "message", "Bulk notification dispatched"));
    }
}
