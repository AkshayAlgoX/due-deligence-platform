package com.realestate.duediligence.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.ExportRequest;
import com.realestate.duediligence.dto.ExportResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.DueDiligenceReportService;
import com.realestate.duediligence.service.ExportService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Tag(name = "Export",
        description = "Download due-diligence reports and property snapshots as PDF or Excel, " +
                "bulk-export multiple reports as a ZIP, and view export download history.")
public class ExportController {

    private final ExportService exportService;
    private final DueDiligenceReportService reportService;
    private final UserRepository userRepository;

    @GetMapping("/report/{reportId}/pdf")
    @Operation(
            summary = "Export report as PDF",
            description = "Generates a full due-diligence report PDF and streams it as a file attachment. " +
                    "The file name encodes the report title, version, and date.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PDF file attachment"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Report not found"),
            @ApiResponse(responseCode = "500", description = "PDF generation failed")
    })
    public ResponseEntity<?> exportReportPdf(
            @Parameter(description = "Report ID", required = true) @PathVariable Long reportId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        try {
            byte[] bytes = exportService.exportReportPdf(reportId, userId);
            DueDiligenceReportResponse report = reportService.getReport(reportId);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + formatReportFileName(report, "pdf") + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(bytes.length)
                    .body(bytes);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(ExportController.class).error("PDF export failed for report {}: {}", reportId, e.getMessage(), e);
            return ResponseEntity.status(500).body(java.util.Map.of("success", false, "message", "Failed to generate PDF. " + e.getMessage()));
        }
    }

    @GetMapping("/report/{reportId}/excel")
    @Operation(
            summary = "Export report as Excel (.xlsx)",
            description = "Generates a structured Excel workbook from the report data with separate sheets " +
                    "for summary, risk factors, comparables, and financial data.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Excel file attachment"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Report not found"),
            @ApiResponse(responseCode = "500", description = "Excel generation failed")
    })
    public ResponseEntity<?> exportReportExcel(
            @Parameter(description = "Report ID", required = true) @PathVariable Long reportId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        try {
            byte[] bytes = exportService.exportReportExcel(reportId, userId);
            DueDiligenceReportResponse report = reportService.getReport(reportId);
            MediaType excelType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + formatReportFileName(report, "xlsx") + "\"")
                    .contentType(excelType).contentLength(bytes.length).body(bytes);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(ExportController.class).error("Excel export failed for report {}: {}", reportId, e.getMessage(), e);
            return ResponseEntity.status(500).body(java.util.Map.of("success", false, "message", "Failed to generate Excel. " + e.getMessage()));
        }
    }

    @GetMapping("/property/{propertyId}/pdf")
    @Operation(
            summary = "Export property snapshot as PDF",
            description = "Generates a quick single-page PDF snapshot of a property's current state " +
                    "(details, risk score, labels) without requiring a full report generation.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Property snapshot PDF attachment"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Property not found"),
            @ApiResponse(responseCode = "500", description = "PDF generation failed")
    })
    public ResponseEntity<?> exportPropertySnapshotPdf(
            @Parameter(description = "Property ID", required = true) @PathVariable Long propertyId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        try {
            byte[] bytes = exportService.exportPropertySnapshotPdf(propertyId, userId);
            String fileName = "DueDiligence_Snapshot_Property_" + propertyId + "_" + LocalDate.now() + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF).contentLength(bytes.length).body(bytes);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(ExportController.class).error("Property PDF failed for {}: {}", propertyId, e.getMessage(), e);
            return ResponseEntity.status(500).body(java.util.Map.of("success", false, "message", "Failed to generate property PDF. " + e.getMessage()));
        }
    }

    @GetMapping("/property/{propertyId}/excel")
    @Operation(
            summary = "Export property snapshot as Excel",
            description = "Generates a quick Excel snapshot of a property's current state.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Property snapshot Excel attachment"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Property not found"),
            @ApiResponse(responseCode = "500", description = "Excel generation failed")
    })
    public ResponseEntity<?> exportPropertySnapshotExcel(
            @Parameter(description = "Property ID", required = true) @PathVariable Long propertyId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        try {
            byte[] bytes = exportService.exportPropertySnapshotExcel(propertyId, userId);
            String fileName = "DueDiligence_Snapshot_Property_" + propertyId + "_" + LocalDate.now() + ".xlsx";
            MediaType excelType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(excelType).contentLength(bytes.length).body(bytes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("success", false, "message", "Failed to generate property Excel. " + e.getMessage()));
        }
    }

    @GetMapping("/report/{reportId}/preview")
    @Operation(
            summary = "Get export preview metadata",
            description = "Returns metadata about a report export (file size estimate, section count, last export date) " +
                    "without generating the actual file. Used by the frontend preview modal.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Preview metadata returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Report not found")
    })
    public ResponseEntity<ExportResponse> getPreview(
            @Parameter(description = "Report ID", required = true) @PathVariable Long reportId,
            Authentication authentication) {
        return ResponseEntity.ok(exportService.getReportPreview(reportId, getUserId(authentication)));
    }

    @PostMapping("/bulk")
    @Operation(
            summary = "Bulk export multiple reports as ZIP",
            description = "Generates a ZIP archive containing PDF or Excel files for multiple reports in one request. " +
                    "Specify report IDs and format in the request body.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "ZIP file attachment"),
            @ApiResponse(responseCode = "400", description = "Invalid request — no report IDs provided"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "500", description = "ZIP generation failed")
    })
    public ResponseEntity<?> exportBulk(
            @RequestBody ExportRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        try {
            byte[] zip = exportService.exportBulk(request, userId);
            String fileName = "DueDiligence_Bulk_Reports_" + LocalDate.now() + ".zip";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.parseMediaType("application/zip"))
                    .contentLength(zip.length).body(zip);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("success", false, "message", "Bulk export failed. " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    @Operation(
            summary = "Get export download history",
            description = "Returns a paginated list of past export downloads for the authenticated user, " +
                    "including format, file size, and download count.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Export history page returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public ResponseEntity<Page<ExportResponse>> getHistory(
            @Parameter(description = "Page number (0-based)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (1–50)", example = "10") @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 50));
        return ResponseEntity.ok(exportService.getExportHistory(getUserId(authentication), pageable));
    }

    @GetMapping("/{exportId}/download")
    @Operation(
            summary = "Re-download an export from history",
            description = "Re-downloads a previously generated export file using its history record ID. " +
                    "Returns 410 Gone if the original file is no longer available.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "File re-downloaded successfully"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Export belongs to a different user"),
            @ApiResponse(responseCode = "404", description = "Export record not found"),
            @ApiResponse(responseCode = "410", description = "Export file no longer available — generate a new one")
    })
    public ResponseEntity<?> downloadFromHistory(
            @Parameter(description = "Export history record ID", required = true) @PathVariable Long exportId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        try {
            byte[] bytes = exportService.downloadExportFromHistory(exportId, userId);
            if (bytes == null || bytes.length == 0) {
                return ResponseEntity.status(410).body(java.util.Map.of("success", false, "message", "Export file no longer available. Please generate a new export."));
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"export_" + exportId + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF).contentLength(bytes.length).body(bytes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(java.util.Map.of("success", false, "message", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(java.util.Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("success", false, "message", "Export could not be generated. " + e.getMessage()));
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Long getUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) return 1L;
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        return user != null ? user.getId() : 1L;
    }

    private String formatReportFileName(DueDiligenceReportResponse report, String extension) {
        String propName = report != null && report.getTitle() != null
                ? report.getTitle().replaceAll("[^a-zA-Z0-9_-]", "_") : "Report";
        int version = report != null && report.getVersion() != null ? report.getVersion() : 1;
        return String.format("DueDiligence_Report_%s_v%d_%s.%s",
                propName, version, LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE), extension);
    }
}
