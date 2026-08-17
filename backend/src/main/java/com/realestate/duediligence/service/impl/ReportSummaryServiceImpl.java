package com.realestate.duediligence.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.duediligence.dto.AiSummaryResponse;
import com.realestate.duediligence.entity.DueDiligenceReport;
import com.realestate.duediligence.entity.ReportSection;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.ReportStatus;
import com.realestate.duediligence.repository.DueDiligenceReportRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.ReportSummaryService;
import com.realestate.duediligence.util.RoleUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportSummaryServiceImpl implements ReportSummaryService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private final DueDiligenceReportRepository reportRepository;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.3-70b-versatile";
    private static final long REGENERATE_COOLDOWN_SECONDS = 60;

    @Override
    @Transactional
    public AiSummaryResponse getOrGenerate(Long reportId, String userEmail) {
        DueDiligenceReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found: " + reportId));

        authorizeReportAccess(report);

        if (report.getStatus() != ReportStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Report must be COMPLETED to generate AI summary");
        }

        if (report.getAiSummary() != null && !report.getAiSummary().isBlank()) {
            log.debug("[ReportSummary] Serving cached summary for report {}", reportId);
            AiSummaryResponse cached = parseFromJson(report.getAiSummary());
            cached.setGeneratedAt(report.getAiSummaryGeneratedAt());
            cached.setCached(true);
            return cached;
        }

        return generateAndCache(report, userEmail);
    }

    @Override
    @Transactional
    public AiSummaryResponse regenerate(Long reportId, String userEmail) {
        DueDiligenceReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found: " + reportId));

        authorizeReportAccess(report);

        if (report.getStatus() != ReportStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Report must be COMPLETED to regenerate AI summary");
        }

        if (report.getAiSummaryGeneratedAt() != null) {
            long secondsSinceLast = Duration.between(
                    report.getAiSummaryGeneratedAt(), LocalDateTime.now()
            ).getSeconds();
            if (secondsSinceLast < REGENERATE_COOLDOWN_SECONDS) {
                long waitSeconds = REGENERATE_COOLDOWN_SECONDS - secondsSinceLast;
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Please wait " + waitSeconds + " seconds before regenerating");
            }
        }

        log.info("[ReportSummary] User {} regenerating summary for report {}", userEmail, reportId);
        return generateAndCache(report, userEmail);
    }

    /** RBAC: report owner or view-all roles (ADMIN / LEGAL_REVIEWER / FINANCIAL_INSTITUTION). */
    private void authorizeReportAccess(DueDiligenceReport report) {
        User currentUser = resolveCurrentUser();
        if (RoleUtils.canViewAllProperties(currentUser)) {
            return;
        }
        if (currentUser == null || report.getGeneratedBy() == null
                || !report.getGeneratedBy().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Report not found: " + report.getId());
        }
    }

    private User resolveCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return null;
            String email = auth.getName();
            if (email == null || email.isBlank()) return null;
            return userRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private AiSummaryResponse generateAndCache(DueDiligenceReport report, String userEmail) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            log.warn("[ReportSummary] GROQ_API_KEY not configured — returning fallback");
            return fallbackSummary(report);
        }

        try {
            String prompt = buildPrompt(report);

            Map<String, Object> requestBody = Map.of(
                    "model", MODEL,
                    "messages", List.of(
                            Map.of("role", "system", "content", getSystemPrompt()),
                            Map.of("role", "user", "content", prompt)
                    ),
                    "stream", false,
                    "max_tokens", 800,
                    "temperature", 0.4,
                    "response_format", Map.of("type", "json_object")
            );

            String response = WebClient.builder()
                    .baseUrl(GROQ_URL)
                    .build()
                    .post()
                    .header("Authorization", "Bearer " + groqApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(45))
                    .block();

            JsonNode json = objectMapper.readTree(response);
            String content = json.path("choices").path(0).path("message").path("content").asText();

            log.debug("[ReportSummary] Groq raw response: {}", content);

            AiSummaryResponse summary = parseFromJson(content);
            summary.setGeneratedAt(LocalDateTime.now());
            summary.setCached(false);

            report.setAiSummary(content);
            report.setAiSummaryGeneratedAt(LocalDateTime.now());
            reportRepository.save(report);

            log.info("[ReportSummary] Generated summary for report {} (verdict={})",
                    report.getId(), summary.getVerdict());

            return summary;

        } catch (Exception e) {
            log.error("[ReportSummary] Failed to generate for report {}: {}",
                    report.getId(), e.getMessage(), e);
            return fallbackSummary(report);
        }
    }

    private String getSystemPrompt() {
        return """
            You are an expert real estate due diligence analyst.
            Your task: read a property due diligence report and produce a concise executive summary.
            
            You MUST respond with valid JSON matching this exact schema:
            {
              "verdict": "PROCEED" | "CAUTION" | "HIGH_RISK",
              "headline": "One sentence, max 15 words, capturing the overall assessment.",
              "keyPoints": ["3-5 short bullet points, each under 20 words, mixing strengths and risks."],
              "recommendation": "2-3 sentence paragraph with clear next-step advice."
            }
            
            Verdict rules:
            - PROCEED: risk score < 40, no critical issues, buyer can proceed with standard checks
            - CAUTION: risk score 40-70, moderate concerns, buyer should verify specific items
            - HIGH_RISK: risk score > 70, or critical legal/fraud/structural red flags
            
            Be direct, specific, and actionable. Cite scores when relevant. No fluff.
            Respond ONLY with the JSON — no markdown, no explanation.
            """;
    }

    private String buildPrompt(DueDiligenceReport report) {
        StringBuilder sb = new StringBuilder();
        sb.append("Analyze this due diligence report and produce an executive summary.\n\n");

        sb.append("REPORT METADATA:\n");
        sb.append("- Property: ").append(report.getTitle()).append("\n");
        if (report.getProperty() != null) {
            sb.append("- Address: ").append(report.getProperty().getAddress()).append("\n");
            if (report.getProperty().getCity() != null) {
                sb.append("- City: ").append(report.getProperty().getCity()).append("\n");
            }
            if (report.getProperty().getPropertyType() != null) {
                sb.append("- Type: ").append(report.getProperty().getPropertyType()).append("\n");
            }
        }
        if (report.getRiskScoreSnapshot() != null) {
            sb.append("- Overall Risk Score: ").append(report.getRiskScoreSnapshot()).append("/100\n");
        }
        sb.append("\n");

        if (report.getExecutiveSummary() != null && !report.getExecutiveSummary().isBlank()) {
            sb.append("EXISTING EXECUTIVE SUMMARY (may be templated):\n");
            sb.append(report.getExecutiveSummary()).append("\n\n");
        }

        if (report.getSections() != null && !report.getSections().isEmpty()) {
            sb.append("REPORT SECTIONS:\n");
          for (ReportSection section : report.getSections()) {
    if (section.getSectionType() == null) continue;

    // sectionType is already a String — no .name() needed
   String type = String.valueOf(section.getSectionType());
    if ("COVER".equals(type)) continue;

                sb.append("\n--- ").append(type).append(" ---\n");
                if (section.getContent() != null && !section.getContent().isBlank()) {
                    String content = section.getContent();
                    if (content.length() > 2000) {
                        content = content.substring(0, 2000) + "... [truncated]";
                    }
                    sb.append(content).append("\n");
                }
            }
        }

        sb.append("\nProduce the JSON summary now.");
        return sb.toString();
    }

    private AiSummaryResponse parseFromJson(String json) {
        try {
            JsonNode node = objectMapper.readTree(json);

            List<String> keyPoints = new ArrayList<>();
            JsonNode pointsNode = node.path("keyPoints");
            if (pointsNode.isArray()) {
                pointsNode.forEach(p -> keyPoints.add(p.asText()));
            }

            String verdict = node.path("verdict").asText("CAUTION");
            if (!List.of("PROCEED", "CAUTION", "HIGH_RISK").contains(verdict)) {
                verdict = "CAUTION";
            }

            return AiSummaryResponse.builder()
                    .verdict(verdict)
                    .headline(node.path("headline").asText("Analysis complete."))
                    .keyPoints(keyPoints.isEmpty()
                            ? List.of("Summary generated but no key points parsed.")
                            : keyPoints)
                    .recommendation(node.path("recommendation").asText(
                            "Review the full report for detailed findings."))
                    .build();
        } catch (Exception e) {
            log.error("[ReportSummary] Failed to parse JSON: {}", e.getMessage());
            return AiSummaryResponse.builder()
                    .verdict("CAUTION")
                    .headline("AI summary parsing failed")
                    .keyPoints(List.of("Please regenerate the summary."))
                    .recommendation("Review the full report manually.")
                    .build();
        }
    }

    private AiSummaryResponse fallbackSummary(DueDiligenceReport report) {
        Double risk = report.getRiskScoreSnapshot();
        String verdict = "CAUTION";
        String headline = "Full analysis available in the report below.";

        if (risk != null) {
            if (risk < 40) {
                verdict = "PROCEED";
                headline = "Property shows acceptable risk levels for standard due diligence.";
            } else if (risk > 70) {
                verdict = "HIGH_RISK";
                headline = "Property shows elevated risk requiring careful evaluation.";
            } else {
                headline = "Property shows moderate risk with specific areas needing verification.";
            }
        }

        return AiSummaryResponse.builder()
                .verdict(verdict)
                .headline(headline)
                .keyPoints(List.of(
                        "AI summary temporarily unavailable — showing risk-based verdict.",
                        "Full report content is available below.",
                        "Try regenerating the summary in a few moments."
                ))
                .recommendation("Please review the full due diligence report for complete findings.")
                .generatedAt(LocalDateTime.now())
                .cached(false)
                .build();
    }
}