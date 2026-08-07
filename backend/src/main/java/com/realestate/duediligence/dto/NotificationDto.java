package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import com.realestate.duediligence.enums.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for a single notification — safe for API responses.
 * Never exposes the User entity directly.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {

    private Long id;
    private NotificationType notificationType;
    private String title;
    private String message;
    private String redirectUrl;
    private boolean isRead;
    private LocalDateTime createdAt;
}
