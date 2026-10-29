package com.realestate.duediligence.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.realestate.duediligence.entity.NotificationPreference;

/**
 * Repository for NotificationPreference entities.
 *
 * Callers should not create rows themselves: use
 * NotificationPreferenceProvisioner, which inserts the default row with
 * insertDefaultsIfAbsent so concurrent first accesses cannot collide on
 * the unique user_id constraint.
 */
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    Optional<NotificationPreference> findByUserId(Long userId);

    /**
     * Inserts a preference row unless one already exists for the user.
     *
     * ON CONFLICT DO NOTHING makes the insert idempotent: if another
     * transaction holds an uncommitted row for the same user, PostgreSQL
     * waits for it and then skips the insert instead of raising a
     * unique-constraint violation (which would abort the caller's transaction).
     *
     * @return 1 if a row was inserted, 0 if one already existed
     */
    @Modifying(flushAutomatically = true)
    @Query(value = """
            INSERT INTO notification_preferences (
                user_id,
                report_ready_email, report_ready_in_app,
                risk_alert_email, risk_alert_in_app,
                price_change_email, price_change_in_app,
                system_email, system_in_app)
            VALUES (
                :userId,
                :reportReadyEmail, :reportReadyInApp,
                :riskAlertEmail, :riskAlertInApp,
                :priceChangeEmail, :priceChangeInApp,
                :systemEmail, :systemInApp)
            ON CONFLICT DO NOTHING
            """, nativeQuery = true)
    int insertDefaultsIfAbsent(@Param("userId") Long userId,
                               @Param("reportReadyEmail") boolean reportReadyEmail,
                               @Param("reportReadyInApp") boolean reportReadyInApp,
                               @Param("riskAlertEmail") boolean riskAlertEmail,
                               @Param("riskAlertInApp") boolean riskAlertInApp,
                               @Param("priceChangeEmail") boolean priceChangeEmail,
                               @Param("priceChangeInApp") boolean priceChangeInApp,
                               @Param("systemEmail") boolean systemEmail,
                               @Param("systemInApp") boolean systemInApp);
}
