package com.realestate.duediligence.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.entity.NotificationPreference;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.NotificationType;
import com.realestate.duediligence.repository.NotificationPreferenceRepository;

import lombok.RequiredArgsConstructor;

/**
 * Listens for notification events and dispatches email delivery.
 *
 * Separated from NotificationServiceImpl to honour Single Responsibility:
 *   - NotificationServiceImpl handles in-app persistence + SSE
 *   - NotificationEventListener handles email side-effects
 *
 * IMPORTANT — dependency design:
 *   This class does NOT inject NotificationServiceImpl to avoid a circular
 *   dependency chain:
 *     ReportGenerationExecutor → NotificationEventListener
 *                              → NotificationServiceImpl
 *                              → (same bean already being constructed)
 *
 *   Instead it injects only what it actually needs:
 *     - EmailService (sends the email)
 *     - NotificationPreferenceRepository (checks preferences directly)
 *
 * All methods are @Async so email delivery never blocks the caller.
 * Email failures are logged and swallowed — they must not propagate
 * back to affect the DB write.
 */
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    private final EmailService emailService;
    private final NotificationPreferenceRepository preferenceRepository;

    // ── Private helpers ───────────────────────────────────────────

    /**
     * Get or create default preferences for a user.
     * Isolated transaction so it can run on the async thread.
     */
    @Transactional
    private NotificationPreference getOrCreatePreference(User user) {
        return preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    com.realestate.duediligence.entity.NotificationPreference defaults =
                            com.realestate.duediligence.entity.NotificationPreference.builder()
                                    .user(user)
                                    .build();
                    return preferenceRepository.save(defaults);
                });
    }

    private boolean isEmailEnabled(NotificationPreference prefs, NotificationType type) {
        return switch (type) {
            case REPORT_READY  -> prefs.isReportReadyEmail();
            case RISK_ALERT    -> prefs.isRiskAlertEmail();
            case PRICE_CHANGE  -> prefs.isPriceChangeEmail();
            case SYSTEM        -> prefs.isSystemEmail();
        };
    }

    // ── Public event handlers ─────────────────────────────────────

    /**
     * Called after a report is completed.
     * Checks preferences and sends email if enabled.
     *
     * @param user            the report owner
     * @param reportTitle     human-readable report name
     * @param propertyAddress the property address
     * @param reportId        used to build the redirect URL in the email
     */
    @Async
    public void onReportReady(User user, String reportTitle, String propertyAddress, Long reportId) {
        try {
            NotificationPreference prefs = getOrCreatePreference(user);

            if (isEmailEnabled(prefs, NotificationType.REPORT_READY)) {
                emailService.sendReportReadyEmail(
                        user.getEmail(),
                        user.getFullName(),
                        reportTitle,
                        propertyAddress,
                        reportId
                );
                log.info("NotificationListener: report-ready email sent to {}", user.getEmail());
            } else {
                log.debug("NotificationListener: report-ready email disabled for user {}",
                        user.getId());
            }
        } catch (Exception e) {
            log.error("NotificationListener: failed to send report-ready email for user {}: {}",
                    user.getId(), e.getMessage());
        }
    }

    /**
     * Called when a risk alert threshold is crossed.
     */
    @Async
    public void onRiskAlert(User user, String propertyAddress, String riskLevel, Long propertyId) {
        try {
            NotificationPreference prefs = getOrCreatePreference(user);

            if (isEmailEnabled(prefs, NotificationType.RISK_ALERT)) {
                emailService.sendRiskAlertEmail(
                        user.getEmail(),
                        user.getFullName(),
                        propertyAddress,
                        riskLevel,
                        propertyId
                );
                log.info("NotificationListener: risk-alert email sent to {}", user.getEmail());
            }
        } catch (Exception e) {
            log.error("NotificationListener: failed to send risk-alert email for user {}: {}",
                    user.getId(), e.getMessage());
        }
    }
}
