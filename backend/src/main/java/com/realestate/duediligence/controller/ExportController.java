package com.realestate.duediligence.controller;

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

import com.realestate.duediligence.dto.ExportRequest;
import com.realestate.duediligence.dto.ExportResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.ExportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;
    private final UserRepository userRepository;

    @GetMapping("/report/{reportId}/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable Long reportId,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        byte[] pdfBytes = exportService.exportReportPdf(reportId, userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report_" + reportId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(pdfBytes);
    }

    @GetMapping("/report/{reportId}/excel")
    public ResponseEntity<byte[]> exportExcel(
            @PathVariable Long reportId,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        byte[] excelBytes = exportService.exportReportExcel(reportId, userId);

        MediaType excelMediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report_" + reportId + ".xlsx\"")
                .contentType(excelMediaType)
                .contentLength(excelBytes.length)
                .body(excelBytes);
    }

    @GetMapping("/report/{reportId}/preview")
    public ResponseEntity<ExportResponse> getPreview(
            @PathVariable Long reportId,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        ExportResponse preview = exportService.getReportPreview(reportId, userId);
        return ResponseEntity.ok(preview);
    }

    @PostMapping("/bulk")
    public ResponseEntity<byte[]> exportBulk(
            @RequestBody ExportRequest request,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        byte[] zipBytes = exportService.exportBulk(request, userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"due_diligence_bulk_reports.zip\"")
                .contentType(MediaType.parseMediaType("application/zip"))
                .contentLength(zipBytes.length)
                .body(zipBytes);
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
    public ResponseEntity<byte[]> downloadFromHistory(
            @PathVariable Long exportId,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        byte[] bytes = exportService.downloadExportFromHistory(exportId, userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"export_" + exportId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(bytes.length)
                .body(bytes);
    }

    private Long getUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return 1L;
        }
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        return user != null ? user.getId() : 1L;
    }
}
