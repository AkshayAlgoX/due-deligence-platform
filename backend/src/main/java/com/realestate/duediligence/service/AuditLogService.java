package com.realestate.duediligence.service;

import java.util.List;
import java.util.Map;

import com.realestate.duediligence.dto.AuditLogDetailDto;
import com.realestate.duediligence.dto.AuditLogDto;
import com.realestate.duediligence.dto.AuditLogFilterRequest;
import com.realestate.duediligence.entity.AuditLog;

public interface AuditLogService {

    /**
     * Save audit log
     */
    AuditLog save(AuditLog auditLog);

    /**
     * List all logs
     */
    List<AuditLogDto> getAllLogs();

    /**
     * Single log details
     */
    AuditLogDetailDto getLogById(Long id);

    /**
     * Filter logs
     */
    List<AuditLogDto> filterLogs(AuditLogFilterRequest request);

    /**
     * Logs of a user
     */
    List<AuditLogDto> getLogsByUser(Long userId);

    /**
     * Logs of a property
     */
    List<AuditLogDto> getLogsByProperty(Long propertyId);

    /**
     * Export logs
     */
    byte[] exportLogs(AuditLogFilterRequest request,
                      String format);

    /**
     * Dashboard statistics
     */
    Map<String, Object> getAuditStatistics();

}