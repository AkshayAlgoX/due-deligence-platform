package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.AiSummaryResponse;
import com.realestate.duediligence.service.ReportSummaryService;
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
public class ReportSummaryController {

    private final ReportSummaryService reportSummaryService;

    @GetMapping("/{id}/ai-summary")
    public ResponseEntity<AiSummaryResponse> getSummary(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails != null ? userDetails.getUsername() : "anonymous";
        log.debug("[ReportSummary] GET /{}/ai-summary by {}", id, email);
        return ResponseEntity.ok(reportSummaryService.getOrGenerate(id, email));
    }

    @PostMapping("/{id}/ai-summary/regenerate")
    public ResponseEntity<AiSummaryResponse> regenerate(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails != null ? userDetails.getUsername() : "anonymous";
        log.info("[ReportSummary] POST /{}/ai-summary/regenerate by {}", id, email);
        return ResponseEntity.ok(reportSummaryService.regenerate(id, email));
    }
}