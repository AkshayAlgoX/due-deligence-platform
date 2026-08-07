package com.realestate.duediligence.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.duediligence.dto.ReportHistoryDto;
import com.realestate.duediligence.service.ReportHistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/report-history")
@RequiredArgsConstructor
public class ReportHistoryController {

    private final ReportHistoryService reportHistoryService;

    /**
     * ==========================================================
     * GET /api/report-history?page=0&size=10&propertyId=123
     * ==========================================================
     */
    @GetMapping
    public ResponseEntity<List<ReportHistoryDto>> getReports(

            @RequestParam(defaultValue = "0") Integer page,

            @RequestParam(defaultValue = "10") Integer size,

            @RequestParam(required = false) Long propertyId) {

        return ResponseEntity.ok(
                reportHistoryService.getReports(propertyId)
        );
    }

    /**
     * ==========================================================
     * GET /api/report-history/{reportId}/versions
     * ==========================================================
     */
    @GetMapping("/{reportId}/versions")
    public ResponseEntity<List<ReportHistoryDto>> getVersions(

            @PathVariable String reportId) {

        return ResponseEntity.ok(
                reportHistoryService.getVersions(reportId)
        );
    }

    /**
     * ==========================================================
     * DELETE /api/report-history/{reportId}/archive
     * ==========================================================
     */
    @DeleteMapping("/{id}/archive")
    public ResponseEntity<Map<String, String>> archive(

            @PathVariable Long id) {

        reportHistoryService.archive(id);

        return ResponseEntity.ok(
                Map.of("message", "Report archived successfully")
        );
    }

    /**
     * ==========================================================
     * POST /api/report-history/{reportId}/share
     * ==========================================================
     */
    @PostMapping("/{id}/share")
    public ResponseEntity<Map<String, String>> share(

            @PathVariable Long id,

            @RequestParam String email) {

        reportHistoryService.share(id, email);

        return ResponseEntity.ok(
                Map.of("message", "Report shared successfully")
        );
    }

}