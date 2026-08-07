package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight DTO for the bell badge count.
 * Returned by GET /api/notifications/unread-count.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCountDto {
    private long unreadCount;
}
