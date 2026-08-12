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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.ExportRequest;
import com.realestate.duediligence.dto.ExportResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.DueDiligenceReportService;
import com.realestate.duediligence.service.ExportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;
    private final DueDiligenceReportService reportService;
    private final UserRepository userRepository;

    // ── 1. Full Versioned Report Downloads ───────────────────────────────────

    @GetMapping("/report/{reportId}/pdf")
    public ResponseEntity<?> exportReportPdf(
            @PathVariable Long reportId,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        try {
            byte[] pdfBytes = exportService.exportReportPdf(reportId, userId);
            DueDiligenceReportResponse report = reportService.getReport(reportId);
            String fileName = formatReportFileName(report, "pdf");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfBytes.length)
                    .body(pdfBytes);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(ExportController.class)
                .error("PDF export failed for report {}: {}", reportId, e.getMessage(), e);
            return ResponseEntity.status(500).body(
                java.util.Map.of("success", false, "message",
                    "Failed to generate PDF. The report may have been deleted. " + e.getMessage()));
        }
    }

    @GetMapping("/report/{reportId}/excel")
    public ResponseEntity<?> exportReportExcel(
            @PathVariable Long reportId,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        try {
            byte[] excelBytes = exportService.exportReportExcel(reportId, userId);
            DueDiligenceReportResponse report = reportService.getReport(reportId);
            String fileName = formatReportFileName(report, "xlsx");
            MediaType excelMediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(excelMediaType)
                    .contentLength(excelBytes.length)
                    .body(excelBytes);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(ExportController.class)
                .error("Excel export failed for report {}: {}", reportId, e.getMessage(), e);
            return ResponseEntity.status(500).body(
                java.util.Map.of("success", false, "message",
                    "Failed to generate Excel. The report may have been deleted. " + e.getMessage()));
        }
    }

    // ── 2. Quick Property Snapshot Downloads ─────────────────────────────────

    @GetMapping("/property/{propertyId}/pdf")
    public ResponseEntity<?> exportPropertySnapshotPdf(
            @PathVariable Long propertyId,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        try {
            byte[] pdfBytes = exportService.exportPropertySnapshotPdf(propertyId, userId);
            String fileName = "DueDiligence_Snapshot_Property_" + propertyId + "_" + LocalDate.now() + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfBytes.length)
                    .body(pdfBytes);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(ExportController.class)
                .error("Property PDF export failed for property {}: {}", propertyId, e.getMessage(), e);
            return ResponseEntity.status(500).body(
                java.util.Map.of("success", false, "message",
                    "Failed to generate property PDF snapshot. " + e.getMessage()));
        }
    }

    @GetMapping("/property/{propertyId}/excel")
    public ResponseEntity<?> exportPropertySnapshotExcel(
            @PathVariable Long propertyId,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        try {
            byte[] excelBytes = exportService.exportPropertySnapshotExcel(propertyId, userId);
            String fileName = "DueDiligence_Snapshot_Property_" + propertyId + "_" + LocalDate.now() + ".xlsx";
            MediaType excelMediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(excelMediaType)
                    .contentLength(excelBytes.length)
                    .body(excelBytes);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(ExportController.class)
                .error("Property Excel export failed for property {}: {}", propertyId, e.getMessage(), e);
            return ResponseEntity.status(500).body(
                java.util.Map.of("success", false, "message",
                    "Failed to generate property Excel snapshot. " + e.getMessage()));
        }
    }

    // ── 3. Preview & Bulk & History Endpoints ─────────────────────────────────

    @GetMapping("/report/{reportId}/preview")
    public ResponseEntity<ExportResponse> getPreview(
            @PathVariable Long reportId,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        ExportResponse preview = exportService.getReportPreview(reportId, userId);
        return ResponseEntity.ok(preview);
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> exportBulk(
            @RequestBody ExportRequest request,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        try {
            byte[] zipBytes = exportService.exportBulk(request, userId);
            String fileName = "DueDiligence_Bulk_Reports_" + LocalDate.now() + ".zip";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.parseMediaType("application/zip"))
                    .contentLength(zipBytes.length)
                    .body(zipBytes);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(ExportController.class)
                .error("Bulk export failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                java.util.Map.of("success", false, "message",
                    "Failed to generate bulk export. One or more reports may have been deleted. " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<Page<ExportResponse>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 50));
        Page<ExportResponse> history = exportService.getExportHistory(userId, pageable);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{exportId}/download")
    public ResponseEntity<?> downloadFromHistory(
            @PathVariable Long exportId,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        try {
            byte[] bytes = exportService.downloadExportFromHistory(exportId, userId);

            if (bytes == null || bytes.length == 0) {
                return ResponseEntity.status(410).body(
                    java.util.Map.of("success", false, "message",
                        "Export file no longer available. The original report may have been deleted. Please generate a new export."));
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"export_" + exportId + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(bytes.length)
                    .body(bytes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(
                java.util.Map.of("success", false, "message", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(
                java.util.Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            // Log full stack trace for debugging
            org.slf4j.LoggerFactory.getLogger(ExportController.class)
                .error("Failed to download export {}: {}", exportId, e.getMessage(), e);
            return ResponseEntity.status(500).body(
                java.util.Map.of("success", false, "message",
                    "Export file could not be generated. The report data may no longer be available. Please try generating a new export."));
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Long getUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            org.slf4j.LoggerFactory.getLogger(ExportController.class)
                .warn("[AUTHZ-DEBUG] getUserId: authentication is null or name is null → defaulting to 1");
            return 1L;
        }
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        Long resolvedId = user != null ? user.getId() : 1L;
        org.slf4j.LoggerFactory.getLogger(ExportController.class)
            .info("[AUTHZ-DEBUG] getUserId: authName={} | resolvedId={} | userFound={}",
                authentication.getName(), resolvedId, user != null);
        return resolvedId;
    }

    private String formatReportFileName(DueDiligenceReportResponse report, String extension) {
        String propName = report != null && report.getTitle() != null
                ? report.getTitle().replaceAll("[^a-zA-Z0-9_-]", "_")
                : "Report";
        int version = report != null && report.getVersion() != null ? report.getVersion() : 1;
        String date = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);

        return String.format("DueDiligence_Report_%s_v%d_%s.%s", propName, version, date, extension);
    }
}
