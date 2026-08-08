package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import com.realestate.duediligence.enums.AuditAction;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDetailDto {

    private Long id;

    private Long userId;

    private String userName;

    private AuditAction action;

    private String entityType;

    private Long entityId;

    private String oldValue;

    private String newValue;

    private String ipAddress;

    private String userAgent;

    private LocalDateTime createdAt;
}
