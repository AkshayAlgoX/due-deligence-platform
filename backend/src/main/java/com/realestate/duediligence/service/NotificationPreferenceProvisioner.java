package com.realestate.duediligence.service;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.entity.NotificationPreference;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.NotificationPreferenceRepository;

import lombok.RequiredArgsConstructor;

/**
 * Single place that creates a user's default notification preferences.
 *
 * Why this exists: the in-app path (NotificationServiceImpl, running inside
 * the report-generation transaction) and the email path
 * (NotificationEventListener, on an @Async thread) both create the row
 * lazily on first use. With find-then-save, the second writer hit the
 * unique user_id constraint and the report-ready email was dropped.
 *
 * getOrCreate inserts with ON CONFLICT DO NOTHING and then re-reads, so
 * any number of concurrent callers get the same row and none of them
 * fails. It is a separate bean (not a private helper) so that the
 * @Transactional proxy actually applies.
 */
@Component
@RequiredArgsConstructor
public class NotificationPreferenceProvisioner {

    private final NotificationPreferenceRepository preferenceRepository;

    @Transactional
    public NotificationPreference getOrCreate(User user) {
        Long userId = user.getId();
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Defaults come from the entity's @Builder.Default values
                    NotificationPreference d = NotificationPreference.builder().build();
                    preferenceRepository.insertDefaultsIfAbsent(userId,
                            d.isReportReadyEmail(), d.isReportReadyInApp(),
                            d.isRiskAlertEmail(), d.isRiskAlertInApp(),
                            d.isPriceChangeEmail(), d.isPriceChangeInApp(),
                            d.isSystemEmail(), d.isSystemInApp());
                    return preferenceRepository.findByUserId(userId)
                            .orElseThrow(() -> new IllegalStateException(
                                    "Notification preferences missing after insert for user " + userId));
                });
    }
}
