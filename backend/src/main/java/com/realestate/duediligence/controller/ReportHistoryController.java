package com.realestate.duediligence.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.duediligence.dto.ReportHistoryDto;
import com.realestate.duediligence.service.ReportHistoryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/report-history")
@RequiredArgsConstructor
@Tag(name = "Report History", description = "Versioned due-diligence report history: listing, versioning, archiving, and sharing")
public class ReportHistoryController {

    private final ReportHistoryService reportHistoryService;

    @GetMapping
    @Operation(
            summary = "List report history",
            description = "Returns report history records, optionally filtered by property ID. Paginated.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Report history list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public ResponseEntity<List<ReportHistoryDto>> getReports(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") Integer page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "Filter by property ID")
            @RequestParam(required = false) Long propertyId) {
        return ResponseEntity.ok(reportHistoryService.getReports(propertyId));
    }

    @GetMapping("/{reportId}/versions")
    @Operation(
            summary = "Get all versions of a report",
            description = "Returns every historical version of the given report, ordered by version number ascending.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Version list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Report not found")
    })
    public ResponseEntity<List<ReportHistoryDto>> getVersions(
            @Parameter(description = "Report string ID (e.g. RPT-2025-000123)", required = true)
            @PathVariable String reportId) {
        return ResponseEntity.ok(reportHistoryService.getVersions(reportId));
    }

    @DeleteMapping("/{id}/archive")
    @Operation(
            summary = "Archive a report history entry",
            description = "Marks a report history record as archived (soft delete). Archived records are hidden from default list views.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Report archived successfully"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Report history record not found")
    })
    public ResponseEntity<Map<String, String>> archive(
            @Parameter(description = "Report history record ID", required = true)
            @PathVariable Long id) {
        reportHistoryService.archive(id);
        return ResponseEntity.ok(Map.of("message", "Report archived successfully"));
    }

    @PostMapping("/{id}/share")
    @Operation(
            summary = "Share a report via email",
            description = "Sends a copy of the report to the specified email address.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Report shared successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or missing email parameter"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Report history record not found")
    })
    public ResponseEntity<Map<String, String>> share(
            @Parameter(description = "Report history record ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Recipient email address", required = true, example = "colleague@example.com")
            @RequestParam String email) {
        reportHistoryService.share(id, email);
        return ResponseEntity.ok(Map.of("message", "Report shared successfully"));
    }
}
