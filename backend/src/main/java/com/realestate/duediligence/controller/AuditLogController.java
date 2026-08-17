package com.realestate.duediligence.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.duediligence.dto.AuditLogDetailDto;
import com.realestate.duediligence.dto.AuditLogDto;
import com.realestate.duediligence.dto.AuditLogFilterRequest;
import com.realestate.duediligence.service.AuditLogService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs",
        description = "Immutable audit trail of all significant user and system actions. " +
                "Requires ROLE_ADMIN (enforced by SecurityConfig).")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(
            summary = "List audit logs with filters",
            description = "Returns a filtered list of audit log entries. " +
                    "Supports filtering by action type, user ID, and date range. " +
                    "Paginated with page/size parameters.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Filtered log list returned"),
            @ApiResponse(responseCode = "400", description = "Invalid action enum value or date format"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public ResponseEntity<List<AuditLogDto>> getAuditLogs(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") Integer page,
            @Parameter(description = "Page size", example = "20")
            @RequestParam(defaultValue = "20") Integer size,
            @Parameter(description = "Filter by AuditAction enum value, e.g. REPORT_GENERATED", example = "REPORT_GENERATED")
            @RequestParam(required = false) String action,
            @Parameter(description = "Filter by user ID")
            @RequestParam(required = false) Long userId,
            @Parameter(description = "Start date inclusive (ISO-8601 date), e.g. 2025-01-01", example = "2025-01-01")
            @RequestParam(required = false) String from,
            @Parameter(description = "End date inclusive (ISO-8601 date), e.g. 2025-12-31", example = "2025-12-31")
            @RequestParam(required = false) String to) {

        AuditLogFilterRequest request = new AuditLogFilterRequest();
        if (action != null && !action.isBlank()) {
            request.setAction(com.realestate.duediligence.enums.AuditAction.valueOf(action.toUpperCase()));
        }
        request.setUserId(userId);
        if (from != null && !from.isBlank()) request.setFromDate(java.time.LocalDate.parse(from));
        if (to != null && !to.isBlank()) request.setToDate(java.time.LocalDate.parse(to));

        return ResponseEntity.ok(auditLogService.filterLogs(request));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get audit log entry by ID",
            description = "Returns the full detail of a single audit log entry, including before/after JSON diff if available.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Log entry returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "Log entry not found")
    })
    public ResponseEntity<AuditLogDetailDto> getLogById(
            @Parameter(description = "Audit log entry ID", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(auditLogService.getLogById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(
            summary = "Get all audit logs for a specific user",
            description = "Returns the complete audit trail for the given user ID, newest first.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Log list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<List<AuditLogDto>> getLogsForUser(
            @Parameter(description = "Target user ID", required = true)
            @PathVariable Long userId) {
        return ResponseEntity.ok(auditLogService.getLogsByUser(userId));
    }

    @GetMapping("/property/{propertyId}")
    @Operation(
            summary = "Get all audit logs for a specific property",
            description = "Returns every audit log entry that references the given property ID, newest first.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Log list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<AuditLogDto>> getLogsForProperty(
            @Parameter(description = "Target property ID", required = true)
            @PathVariable Long propertyId) {
        return ResponseEntity.ok(auditLogService.getLogsByProperty(propertyId));
    }

    @GetMapping("/export")
    @Operation(
            summary = "Export audit logs as CSV or Excel",
            description = "Exports filtered audit logs as a downloadable file. " +
                    "Supports format=csv (UTF-8 with BOM) or format=excel (.xlsx). " +
                    "Accepts the same filters as GET /api/audit-logs.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "File returned as binary attachment"),
            @ApiResponse(responseCode = "400", description = "Invalid filter parameters or format"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN"),
            @ApiResponse(responseCode = "500", description = "Export generation failed")
    })
    public ResponseEntity<?> exportLogs(
            @Parameter(description = "Export format: csv or excel", example = "csv")
            @RequestParam(defaultValue = "csv") String format,
            @Parameter(description = "Filter by AuditAction enum value", example = "LOGIN")
            @RequestParam(required = false) String action,
            @Parameter(description = "Filter by user ID")
            @RequestParam(required = false) Long userId,
            @Parameter(description = "Start date inclusive (ISO-8601)", example = "2025-01-01")
            @RequestParam(required = false) String from,
            @Parameter(description = "End date inclusive (ISO-8601)", example = "2025-12-31")
            @RequestParam(required = false) String to) {

        try {
            AuditLogFilterRequest request = new AuditLogFilterRequest();
            if (action != null && !action.isBlank()) {
                request.setAction(com.realestate.duediligence.enums.AuditAction.valueOf(action.toUpperCase()));
            }
            request.setUserId(userId);
            if (from != null && !from.isBlank()) request.setFromDate(java.time.LocalDate.parse(from));
            if (to != null && !to.isBlank()) request.setToDate(java.time.LocalDate.parse(to));

            byte[] data = auditLogService.exportLogs(request, format);
            MediaType contentType = "csv".equalsIgnoreCase(format)
                    ? MediaType.parseMediaType("text/csv;charset=UTF-8")
                    : MediaType.APPLICATION_OCTET_STREAM;

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit_logs." + format)
                    .contentType(contentType)
                    .body(data);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(AuditLogController.class)
                    .error("Audit log export failed (format={}): {}", format, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("success", false,
                    "message", "Failed to export audit logs. " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @Operation(
            summary = "Get audit log action statistics",
            description = "Returns a map of AuditAction → count for all recorded events. " +
                    "Used to populate the admin audit activity graph.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Statistics map returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public ResponseEntity<Map<String, Object>> getStats() {
        return new ResponseEntity<>(auditLogService.getAuditStatistics(), HttpStatus.OK);
    }
}
