package com.realestate.duediligence.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.ContactSubmitRequest;
import com.realestate.duediligence.entity.ContactMessage;
import com.realestate.duediligence.repository.ContactMessageRepository;
import com.realestate.duediligence.service.EmailService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Public contact form endpoint.
 *
 * Flow:
 *   1. Validate payload
 *   2. Persist to contact_messages table
 *   3. Send email to team inbox
 *   4. Send auto-reply to the submitter
 *   5. Return success (never leaks internal errors to the client)
 */
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Tag(name = "Contact",
        description = "Public contact form. No authentication required. " +
                "Persists submissions and delivers email notifications.")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);
    private static final String TEAM_INBOX = "duedeligence8@gmail.com";

    private final ContactMessageRepository contactMessageRepository;
    private final EmailService emailService;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @PostMapping("/submit")
    @Operation(
            summary = "Submit a contact form message",
            description = "Accepts a contact form submission (name, email, topic, message), persists it to the " +
                    "database, sends a notification to the team inbox, and sends an auto-reply to the submitter. " +
                    "This endpoint is public — no authentication required.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Message received and emails dispatched"),
            @ApiResponse(responseCode = "400", description = "Validation failure — missing required fields or invalid email"),
            @ApiResponse(responseCode = "500", description = "Database write failed (emails not sent)")
    })
    public ResponseEntity<Map<String, Object>> submit(@Valid @RequestBody ContactSubmitRequest request) {

        ContactMessage saved;
        try {
            ContactMessage msg = ContactMessage.builder()
                    .name(request.getName().trim())
                    .email(request.getEmail().trim().toLowerCase())
                    .company(request.getCompany() != null ? request.getCompany().trim() : null)
                    .topic(request.getTopic())
                    .message(request.getMessage().trim())
                    .createdAt(LocalDateTime.now())
                    .build();
            saved = contactMessageRepository.save(msg);
            log.info("Contact message saved: id={} topic={} from={}", saved.getId(), saved.getTopic(), saved.getEmail());
        } catch (Exception e) {
            log.error("Failed to persist contact message: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Something went wrong. Please email us directly at " + TEAM_INBOX));
        }

        try {
            emailService.sendEmail(TEAM_INBOX,
                    "[TEAM INBOX] " + prettyTopic(request.getTopic()) + " from " + saved.getName(),
                    buildTeamEmailHtml(saved), "contact team notification");
        } catch (Exception e) {
            log.warn("Team notification email failed (message id={}): {}", saved.getId(), e.getMessage());
        }

        try {
            emailService.sendEmail(saved.getEmail(),
                    "We received your message — Real Estate Due Diligence",
                    buildAutoReplyHtml(saved), "contact auto-reply");
        } catch (Exception e) {
            log.warn("Auto-reply email failed (message id={}): {}", saved.getId(), e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message received. We'll reply within 24 hours on business days."));
    }

    // ── Email templates (unchanged) ──────────────────────────────

    private String buildTeamEmailHtml(ContactMessage m) {
        String company = m.getCompany() != null && !m.getCompany().isBlank() ? m.getCompany() : "—";
        return "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
                + " max-width: 620px; margin: 0 auto; padding: 24px; background:#f8fafc;\">"
                + "<div style=\"background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;\">"
                + "<div style=\"background: linear-gradient(135deg,#8b5cf6,#6d28d9); padding:20px 24px;\">"
                + "<p style=\"margin:0 0 6px; font-size:13px; font-weight:700; color:rgba(255,255,255,0.9);\">&#128229; NEW CONTACT SUBMISSION</p>"
                + "<h2 style=\"margin:0; color:#fff; font-size:18px;\">Team inbox notification</h2>"
                + "<p style=\"margin:4px 0 0; color:rgba(255,255,255,0.85); font-size:13px;\">Topic: " + prettyTopic(m.getTopic()) + "</p>"
                + "</div><div style=\"padding:24px;\">"
                + "<table style=\"width:100%; border-collapse:collapse; font-size:14px; color:#0f172a;\">"
                + row("Name", escape(m.getName())) + row("Email", escape(m.getEmail()))
                + row("Company", escape(company)) + row("Topic", prettyTopic(m.getTopic()))
                + row("Received", m.getCreatedAt().toString()) + "</table>"
                + "<div style=\"margin-top:20px; padding:16px; background:#f1f5f9; border-left:3px solid #8b5cf6; border-radius:6px;\">"
                + "<p style=\"margin:0 0 6px; font-size:12px; text-transform:uppercase; color:#64748b;\">Message</p>"
                + "<p style=\"margin:0; font-size:14px; line-height:1.6; white-space:pre-wrap;\">" + escape(m.getMessage()) + "</p>"
                + "</div></div></div></div>";
    }

    private String buildAutoReplyHtml(ContactMessage m) {
        String firstName = m.getName().split("\\s+")[0];
        return "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
                + " max-width: 560px; margin: 0 auto; padding: 24px; background:#f8fafc;\">"
                + "<div style=\"background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;\">"
                + "<div style=\"background: linear-gradient(135deg,#10b981,#059669); padding:24px;\">"
                + "<h2 style=\"margin:0; color:#fff; font-size:20px;\">Hi " + escape(firstName) + ", we've got your message ✓</h2>"
                + "</div><div style=\"padding:24px; color:#0f172a; font-size:14px; line-height:1.65;\">"
                + "<p>Thanks for reaching out to <strong>Real Estate Due Diligence</strong>.</p>"
                + "<p>We'll reply within <strong>24 hours on business days</strong>.</p>"
                + "<p style=\"margin:24px 0 0; color:#64748b; font-size:12px;\">— The Real Estate Due Diligence team</p>"
                + "</div></div></div>";
    }

    private String row(String label, String value) {
        return "<tr><td style=\"padding:8px 0; color:#64748b; width:110px;\">" + label + "</td>"
                + "<td style=\"padding:8px 0;\">" + value + "</td></tr>";
    }

    private String prettyTopic(String topic) {
        if (topic == null) return "General";
        return switch (topic.toLowerCase()) {
            case "enterprise" -> "Enterprise sales";
            case "technical" -> "Technical support";
            case "billing" -> "Billing";
            case "partnership" -> "Partnership";
            default -> "General enquiry";
        };
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
