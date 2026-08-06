package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import com.realestate.duediligence.enums.AuditAction;
import com.realestate.duediligence.entity.AuditLog;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuditLogDto {

    private Long id;
    private Long userId;
    private String userName;
    private AuditAction action;
    private String entityType;
    private Long entityId;
    private String ipAddress;
    private LocalDateTime createdAt;

    public AuditLogDto(AuditLog log) {
        this.id = log.getId();

        if (log.getUser() != null) {
            this.userId = log.getUser().getId();
            this.userName = log.getUser().getFullName();
        }

        this.action = log.getAction();

        this.entityType = log.getResourceType();

        this.entityId = log.getResourceId();

        this.ipAddress = log.getIpAddress();

        this.createdAt = log.getCreatedAt();
    }
}