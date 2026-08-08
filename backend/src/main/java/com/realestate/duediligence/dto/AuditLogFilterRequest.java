package com.realestate.duediligence.dto;

import java.time.LocalDate;

import com.realestate.duediligence.enums.AuditAction;

import lombok.Data;

@Data
public class AuditLogFilterRequest {

    private AuditAction action;

    private Long userId;

    private String entityType;

    private LocalDate fromDate;

    private LocalDate toDate;

    private Integer page = 0;

    private Integer size = 20;
}