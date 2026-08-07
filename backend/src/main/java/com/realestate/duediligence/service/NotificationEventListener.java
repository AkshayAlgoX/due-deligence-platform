package com.realestate.duediligence.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.realestate.duediligence.entity.NotificationPreference;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.NotificationType;
import com.realestate.duediligence.service.impl.NotificationServiceImpl;

import lombok.RequiredArgsConstructor;

/**
 * Listens for notification events and dispatches email delivery.
 *
 * Separated from NotificationServiceImpl to honour Single Responsibility:
 *   - NotificationServiceImpl handles in-app persistence + SSE
 *   - NotificationEventListener handles email side-effects
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
    private final NotificationServiceImpl notificationService;

    /**
     * Called after a report is completed.
     * Checks preferences and sends email if enabled.
     *
     * @param user            the report owner
     * @param reportTitle     human-readable report name
     * @param propertyAddress the property address
     * @param reportId        used to build the redirect URL
     */
    @Async
    public void onReportReady(User user, String reportTitle, String propertyAddress, Long reportId) {
        try {
            NotificationPreference prefs = notificationService.getOrCreatePreferenceForUser(user);

            if (notificationService.isEmailEnabled(prefs, NotificationType.REPORT_READY)) {
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
            NotificationPreference prefs = notificationService.getOrCreatePreferenceForUser(user);

            if (notificationService.isEmailEnabled(prefs, NotificationType.RISK_ALERT)) {
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
