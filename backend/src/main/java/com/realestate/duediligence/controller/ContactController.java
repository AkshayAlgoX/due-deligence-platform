package com.realestate.duediligence.controller;

import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.ContactSubmitRequest;
import com.realestate.duediligence.entity.ContactMessage;
import com.realestate.duediligence.repository.ContactMessageRepository;
import com.realestate.duediligence.service.EmailService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Public contact-form endpoint for the marketing site.
 * Saves the message to the DB and notifies the team by email.
 */
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);
    private static final Set<String> VALID_TOPICS = Set.of(
            "general", "enterprise", "technical", "billing", "partnership");

    private final ContactMessageRepository repository;
    private final EmailService emailService;

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submit(
            @Valid @RequestBody ContactSubmitRequest request) {

        String topic = request.getTopic().trim().toLowerCase();
        if (!VALID_TOPICS.contains(topic)) {
            return ResponseEntity.badRequest().body(
                Map.of("success", false, "message", "Invalid topic. Choose from: general, enterprise, technical, billing, partnership."));
        }

        ContactMessage msg = ContactMessage.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .company(request.getCompany() != null ? request.getCompany().trim() : null)
                .topic(topic)
                .message(request.getMessage().trim())
                .build();
        repository.save(msg);

        try {
            emailService.sendContactNotification(msg);
        } catch (Exception e) {
            // Don't fail the request if notification email fails — message is still saved
            log.warn("Failed to send contact notification email: {}", e.getMessage());
        }

        log.info("Contact message received: id={}, topic={}, from={}", msg.getId(), topic, msg.getEmail());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thanks for reaching out. We'll get back to you within 24 hours."));
    }
}
