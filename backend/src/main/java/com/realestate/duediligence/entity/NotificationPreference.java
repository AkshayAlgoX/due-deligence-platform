package com.realestate.duediligence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Per-user notification preference matrix.
 *
 * Each NotificationType × Channel combination gets its own boolean flag.
 * Defaults are set so users receive in-app notifications for everything
 * and emails only for the important events (report ready, system).
 *
 * Created lazily on first access — users without a preference row
 * receive a default preference object from the service layer.
 */
@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Back-reference to the owning user.
     * UNIQUE constraint ensures one-to-one.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ── REPORT_READY ─────────────────────────────────────────────
    @Column(name = "report_ready_email", nullable = false)
    @Builder.Default
    private boolean reportReadyEmail = true;

    @Column(name = "report_ready_in_app", nullable = false)
    @Builder.Default
    private boolean reportReadyInApp = true;

    // ── RISK_ALERT ────────────────────────────────────────────────
    @Column(name = "risk_alert_email", nullable = false)
    @Builder.Default
    private boolean riskAlertEmail = true;

    @Column(name = "risk_alert_in_app", nullable = false)
    @Builder.Default
    private boolean riskAlertInApp = true;

    // ── PRICE_CHANGE ──────────────────────────────────────────────
    @Column(name = "price_change_email", nullable = false)
    @Builder.Default
    private boolean priceChangeEmail = false;

    @Column(name = "price_change_in_app", nullable = false)
    @Builder.Default
    private boolean priceChangeInApp = true;

    // ── SYSTEM ────────────────────────────────────────────────────
    @Column(name = "system_email", nullable = false)
    @Builder.Default
    private boolean systemEmail = true;

    @Column(name = "system_in_app", nullable = false)
    @Builder.Default
    private boolean systemInApp = true;
}
