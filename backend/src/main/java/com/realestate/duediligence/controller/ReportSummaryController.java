package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.AiSummaryResponse;
import com.realestate.duediligence.service.ReportSummaryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Report AI Summary",
        description = "AI-generated executive summaries for due-diligence reports. " +
                "Powered by Groq LLM. Summaries are generated on first request and cached per report.")
public class ReportSummaryController {

    private final ReportSummaryService reportSummaryService;

    @GetMapping("/{id}/ai-summary")
    @Operation(
            summary = "Get AI executive summary for a report",
            description = "Returns the AI-generated executive summary for the given report. " +
                    "If no summary exists yet, generates one on-demand and persists it. " +
                    "Returns verdict, key findings, and recommended next steps.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "AI summary returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Report not found"),
            @ApiResponse(responseCode = "503", description = "AI service (Groq) temporarily unavailable")
    })
    public ResponseEntity<AiSummaryResponse> getSummary(
            @Parameter(description = "Report ID", required = true) @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "anonymous";
        log.debug("[ReportSummary] GET /{}/ai-summary by {}", id, email);
        return ResponseEntity.ok(reportSummaryService.getOrGenerate(id, email));
    }

    @PostMapping("/{id}/ai-summary/regenerate")
    @Operation(
            summary = "Regenerate AI executive summary",
            description = "Forces regeneration of the AI executive summary, discarding the cached version. " +
                    "Use when report data has changed significantly or the previous summary was unsatisfactory.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "New AI summary generated and returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Report not found"),
            @ApiResponse(responseCode = "503", description = "AI service (Groq) temporarily unavailable")
    })
    public ResponseEntity<AiSummaryResponse> regenerate(
            @Parameter(description = "Report ID", required = true) @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "anonymous";
        log.info("[ReportSummary] POST /{}/ai-summary/regenerate by {}", id, email);
        return ResponseEntity.ok(reportSummaryService.regenerate(id, email));
    }
}
