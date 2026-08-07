package com.realestate.duediligence.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.realestate.duediligence.enums.NotificationType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Persisted in-app notification for a user.
 *
 * One row per notification event — e.g. "Report #42 is ready".
 * Multiple channels (email, push) are handled by NotificationService;
 * this entity only stores the in-app record.
 *
 * Indexes on (user_id, is_read) and (user_id, created_at) ensure
 * fast unread counts and paginated history queries.
 */
@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notif_user_read",       columnList = "user_id, is_read"),
        @Index(name = "idx_notif_user_created",    columnList = "user_id, created_at"),
        @Index(name = "idx_notif_type",            columnList = "notification_type")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Owner of this notification.
     * Cascade-deleted when the user is removed.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 30)
    private NotificationType notificationType;

    /** Short headline — e.g. "Your report is ready" */
    @Column(nullable = false, length = 255)
    private String title;

    /** Full notification body — e.g. "Due diligence report for 123 Main St has been generated." */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /**
     * Optional deep-link for click-to-navigate.
     * e.g. "/reports/42" or "/dashboard/risk-assessment?propertyId=7"
     */
    @Column(name = "redirect_url", length = 500)
    private String redirectUrl;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
