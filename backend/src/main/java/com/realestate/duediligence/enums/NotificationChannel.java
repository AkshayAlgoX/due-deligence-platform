package com.realestate.duediligence.enums;

/**
 * Delivery channel for a notification.
 *
 * Currently supported:
 *   IN_APP  — stored in DB, visible in notification centre
 *   EMAIL   — sent via JavaMailSender / EmailService
 *   PUSH    — reserved for future mobile/browser push (not yet wired)
 */
public enum NotificationChannel {
    IN_APP,
    EMAIL,
    PUSH
}
