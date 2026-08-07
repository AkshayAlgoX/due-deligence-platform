package com.realestate.duediligence.service.impl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.dto.NotificationCountDto;
import com.realestate.duediligence.dto.NotificationDto;
import com.realestate.duediligence.dto.NotificationPreferenceDto;
import com.realestate.duediligence.dto.UpdatePreferencesRequest;
import com.realestate.duediligence.entity.Notification;
import com.realestate.duediligence.entity.NotificationPreference;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.NotificationType;
import com.realestate.duediligence.repository.NotificationPreferenceRepository;
import com.realestate.duediligence.repository.NotificationRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.NotificationEventPublisher;
import com.realestate.duediligence.service.NotificationService;

import lombok.RequiredArgsConstructor;

/**
 * Core implementation of the Notification System.
 *
 * Responsibilities:
 *  - Create in-app notifications respecting per-user preferences
 *  - Publish SSE events for real-time delivery
 *  - CRUD: read, mark-read, delete, clear
 *  - Manage notification preferences
 *  - Admin: test send, bulk broadcast
 *
 * Security: all user-facing methods resolve the authenticated user
 * from SecurityContext. The createForUser() variant accepts an
 * explicit User for async contexts (no SecurityContext available).
 */
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final NotificationEventPublisher eventPublisher;

    // ══════════════════════════════════════════════════════════════
    // CREATION
    // ══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public NotificationDto createForUser(User user, NotificationType type,
                                         String title, String message, String redirectUrl) {
        if (user == null) {
            log.warn("Notification: createForUser called with null user, skipping");
            return null;
        }

        // Check in-app preference before persisting
        NotificationPreference prefs = getOrCreatePreference(user);
        if (!isInAppEnabled(prefs, type)) {
            log.debug("Notification: in-app disabled for type {} / user {}", type, user.getId());
            return null;
        }

        Notification notification = Notification.builder()
                .user(user)
                .notificationType(type)
                .title(title)
                .message(message)
                .redirectUrl(redirectUrl)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created: id={}, type={}, user={}", saved.getId(), type, user.getId());

        NotificationDto dto = toDto(saved);

        // Push SSE event — best-effort (won't fail the DB write)
        try {
            eventPublisher.publish(user.getId(), dto);
        } catch (Exception e) {
            log.warn("Notification: SSE push failed for user {}: {}", user.getId(), e.getMessage());
        }

        return dto;
    }

    // ══════════════════════════════════════════════════════════════
    // QUERIES
    // ══════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotifications(Pageable pageable, boolean unreadOnly) {
        Long userId = requireCurrentUserId();
        Page<Notification> page = unreadOnly
                ? notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return page.map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotificationsByType(NotificationType type, Pageable pageable) {
        Long userId = requireCurrentUserId();
        return notificationRepository
                .findByUserIdAndNotificationTypeOrderByCreatedAtDesc(userId, type, pageable)
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationCountDto getUnreadCount() {
        Long userId = requireCurrentUserId();
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return new NotificationCountDto(count);
    }

    // ══════════════════════════════════════════════════════════════
    // MUTATIONS
    // ══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Long userId = requireCurrentUserId();
        int updated = notificationRepository.markAsRead(notificationId, userId);
        if (updated == 0) {
            log.warn("Notification: markAsRead failed — id={} not found or not owned by user={}",
                    notificationId, userId);
            throw new RuntimeException("Notification not found: " + notificationId);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        Long userId = requireCurrentUserId();
        int count = notificationRepository.markAllAsRead(userId);
        log.info("Notification: marked {} as read for user {}", count, userId);
    }

    @Override
    @Transactional
    public void delete(Long notificationId) {
        Long userId = requireCurrentUserId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Notification not found: " + notificationId);
        }

        notificationRepository.delete(notification);
        log.info("Notification: deleted id={} for user={}", notificationId, userId);
    }

    @Override
    @Transactional
    public void clearAll() {
        Long userId = requireCurrentUserId();
        notificationRepository.deleteAllByUserId(userId);
        log.info("Notification: cleared all for user={}", userId);
    }

    // ══════════════════════════════════════════════════════════════
    // PREFERENCES
    // ══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public NotificationPreferenceDto getPreferences() {
        User user = requireCurrentUser();
        NotificationPreference prefs = getOrCreatePreference(user);
        return toPreferenceDto(prefs);
    }

    @Override
    @Transactional
    public NotificationPreferenceDto updatePreferences(UpdatePreferencesRequest request) {
        User user = requireCurrentUser();
        NotificationPreference prefs = getOrCreatePreference(user);

        prefs.setReportReadyEmail(request.isReportReadyEmail());
        prefs.setReportReadyInApp(request.isReportReadyInApp());
        prefs.setRiskAlertEmail(request.isRiskAlertEmail());
        prefs.setRiskAlertInApp(request.isRiskAlertInApp());
        prefs.setPriceChangeEmail(request.isPriceChangeEmail());
        prefs.setPriceChangeInApp(request.isPriceChangeInApp());
        prefs.setSystemEmail(request.isSystemEmail());
        prefs.setSystemInApp(request.isSystemInApp());

        NotificationPreference saved = preferenceRepository.save(prefs);
        log.info("Notification preferences updated for user={}", user.getId());
        return toPreferenceDto(saved);
    }

    // ══════════════════════════════════════════════════════════════
    // ADMIN / TEST
    // ══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public NotificationDto sendTestNotification() {
        User user = requireCurrentUser();
        return createForUser(
                user,
                NotificationType.SYSTEM,
                "Test Notification",
                "This is a test notification from the platform. If you can see this, SSE and in-app notifications are working correctly.",
                "/dashboard/notifications"
        );
    }

    @Override
    @Transactional
    public void sendBulkSystemNotification(String title, String message) {
        log.info("Notification: broadcasting bulk system notification to all users");
        List<User> allUsers = userRepository.findAll();

        int sent = 0;
        for (User user : allUsers) {
            NotificationPreference prefs = getOrCreatePreference(user);
            if (prefs.isSystemInApp()) {
                createForUser(user, NotificationType.SYSTEM, title, message, "/dashboard/notifications");
                sent++;
            }
        }
        log.info("Notification: bulk system notification sent to {} users", sent);
    }

    // ══════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════

    private User requireCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new RuntimeException("Authentication required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + auth.getName()));
    }

    private Long requireCurrentUserId() {
        return requireCurrentUser().getId();
    }

    /**
     * Get existing preference or create a default one.
     * Saves the default immediately so the row exists for future calls.
     */
    private NotificationPreference getOrCreatePreference(User user) {
        return preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    NotificationPreference defaults = NotificationPreference.builder()
                            .user(user)
                            .build();
                    return preferenceRepository.save(defaults);
                });
    }

    /**
     * Check whether in-app delivery is enabled for a given notification type.
     */
    private boolean isInAppEnabled(NotificationPreference prefs, NotificationType type) {
        return switch (type) {
            case REPORT_READY  -> prefs.isReportReadyInApp();
            case RISK_ALERT    -> prefs.isRiskAlertInApp();
            case PRICE_CHANGE  -> prefs.isPriceChangeInApp();
            case SYSTEM        -> prefs.isSystemInApp();
        };
    }

    /**
     * Get or create preference for an explicit user (used by email listener).
     * Public so NotificationEventListener can call it.
     */
    public NotificationPreference getOrCreatePreferenceForUser(User user) {
        return getOrCreatePreference(user);
    }

    // ── DTO mappers ───────────────────────────────────────────────

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .notificationType(n.getNotificationType())
                .title(n.getTitle())
                .message(n.getMessage())
                .redirectUrl(n.getRedirectUrl())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private NotificationPreferenceDto toPreferenceDto(NotificationPreference p) {
        return NotificationPreferenceDto.builder()
                .reportReadyEmail(p.isReportReadyEmail())
                .reportReadyInApp(p.isReportReadyInApp())
                .riskAlertEmail(p.isRiskAlertEmail())
                .riskAlertInApp(p.isRiskAlertInApp())
                .priceChangeEmail(p.isPriceChangeEmail())
                .priceChangeInApp(p.isPriceChangeInApp())
                .systemEmail(p.isSystemEmail())
                .systemInApp(p.isSystemInApp())
                .build();
    }
}
