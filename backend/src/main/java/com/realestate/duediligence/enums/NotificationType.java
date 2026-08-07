package com.realestate.duediligence.enums;

/**
 * Classifies the kind of notification being sent.
 *
 * Used for filtering, icon selection, and routing on both
 * backend (preferences check) and frontend (display logic).
 */
public enum NotificationType {
    REPORT_READY,   // Due diligence report generation completed
    RISK_ALERT,     // Risk score crossed a threshold
    PRICE_CHANGE,   // Comparable property price movement
    SYSTEM          // Platform-level announcements / admin messages
}
