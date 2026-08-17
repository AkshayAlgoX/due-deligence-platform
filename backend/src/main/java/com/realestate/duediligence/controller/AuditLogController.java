package com.realestate.duediligence.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.realestate.duediligence.dto.AuditLogDetailDto;
import com.realestate.duediligence.dto.AuditLogDto;
import com.realestate.duediligence.dto.AuditLogFilterRequest;
import com.realestate.duediligence.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    /**
     * ==========================================================
     * GET /api/audit-logs
     * Supports:
     * page
     * size
     * action
     * userId
     * from
     * to
     * ==========================================================
     */
    @GetMapping
    public ResponseEntity<List<AuditLogDto>> getAuditLogs(

            @RequestParam(defaultValue = "0") Integer page,

            @RequestParam(defaultValue = "20") Integer size,

            @RequestParam(required = false) String action,

            @RequestParam(required = false) Long userId,

            @RequestParam(required = false) String from,

            @RequestParam(required = false) String to

    ) {

        AuditLogFilterRequest request = new AuditLogFilterRequest();

        if (action != null && !action.isBlank()) {
            request.setAction(com.realestate.duediligence.enums.AuditAction.valueOf(action.toUpperCase()));
      }

      request.setUserId(userId);

      if (from != null && !from.isBlank()) {
          request.setFromDate(java.time.LocalDate.parse(from));
      }

      if (to != null && !to.isBlank()) {
          request.setToDate(java.time.LocalDate.parse(to));
  }

        return ResponseEntity.ok(auditLogService.filterLogs(request));
    }

    /**
     * ==========================================================
     * GET /api/audit-logs/{id}
     * ==========================================================
     */
    @GetMapping("/{id}")
    public ResponseEntity<AuditLogDetailDto> getLogById(
            @PathVariable Long id) {

        return ResponseEntity.ok(auditLogService.getLogById(id));
    }

    /**
     * ==========================================================
     * GET /api/audit-logs/user/{userId}
     * ==========================================================
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLogDto>> getLogsForUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                auditLogService.getLogsByUser(userId)
        );
    }

    /**
     * ==========================================================
     * GET /api/audit-logs/property/{propertyId}
     * ==========================================================
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<AuditLogDto>> getLogsForProperty(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                auditLogService.getLogsByProperty(propertyId)
        );
    }

    /**
     * ==========================================================
     * GET /api/audit-logs/export
     * ==========================================================
     */
    @GetMapping("/export")
    public ResponseEntity<?> exportLogs(

            @RequestParam(defaultValue = "csv") String format,

            @RequestParam(required = false) String action,

            @RequestParam(required = false) Long userId,

            @RequestParam(required = false) String from,

            @RequestParam(required = false) String to

    ) {
        try {
            AuditLogFilterRequest request = new AuditLogFilterRequest();

            if (action != null && !action.isBlank()) {
                request.setAction(com.realestate.duediligence.enums.AuditAction.valueOf(action.toUpperCase()));
            }

            request.setUserId(userId);

            if (from != null && !from.isBlank()) {
                request.setFromDate(java.time.LocalDate.parse(from));
           }

            if (to != null && !to.isBlank()) {
                request.setToDate(java.time.LocalDate.parse(to));
            }

            byte[] data = auditLogService.exportLogs(request, format);

            MediaType contentType = "csv".equalsIgnoreCase(format)
                    ? MediaType.parseMediaType("text/csv;charset=UTF-8")
                    : MediaType.APPLICATION_OCTET_STREAM;

            return ResponseEntity.ok()

                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=audit_logs." + format)

                    .contentType(contentType)

                    .body(data);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(AuditLogController.class)
                .error("Audit log export failed (format={}): {}", format, e.getMessage(), e);
            return ResponseEntity.status(500).body(
                java.util.Map.of("success", false, "message",
                    "Failed to export audit logs. " + e.getMessage()));
        }
    }

    /**
     * ==========================================================
     * GET /api/audit-logs/stats
     * ==========================================================
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {

        return new ResponseEntity<>(
                auditLogService.getAuditStatistics(),
                HttpStatus.OK
        );
    }

}