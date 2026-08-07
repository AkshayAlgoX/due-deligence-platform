package com.realestate.duediligence.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.NotificationEventPublisher;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * Server-Sent Events controller for real-time notifications.
 *
 * The SSE endpoint is whitelisted in SecurityConfig so the browser's
 * native EventSource API can connect. JWT authentication is performed
 * manually from the SecurityContext (set by JwtAuthenticationFilter
 * which runs on ALL requests including SSE ones).
 *
 * WHY NOT USE A TOKEN QUERY PARAM:
 * EventSource cannot send custom headers. The standard workaround is
 * a token query param, but since our JWT filter reads the Authorization
 * header, we instead rely on cookies + Next.js same-origin proxy so
 * the filter works transparently. The SSE endpoint requires auth — if
 * the SecurityContext has no authenticated user, a 401 is returned.
 *
 * Client reconnection:
 * The browser's EventSource reconnects automatically after 3s on disconnect.
 * The SseEmitter has a 30-minute timeout, after which the client reconnects.
 */
@RestController
@RequestMapping("/api/sse")
@RequiredArgsConstructor
@Tag(name = "SSE", description = "Server-Sent Events for real-time notification delivery")
public class SseController {

    private static final Logger log = LoggerFactory.getLogger(SseController.class);

    private final NotificationEventPublisher eventPublisher;
    private final UserRepository userRepository;

    /**
     * Open an SSE stream for the authenticated user.
     *
     * GET /api/sse/notifications
     *
     * Response:
     *   Content-Type: text/event-stream
     *   event: ping → sent immediately to confirm connection
     *   event: notification → sent when a new notification arrives
     */
    @GetMapping(value = "/notifications", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(
            summary = "Subscribe to real-time notifications",
            description = "Opens an SSE stream. The client receives 'notification' events " +
                    "whenever a new notification is created for the authenticated user. " +
                    "An initial 'ping' event confirms the connection.")
    public ResponseEntity<SseEmitter> subscribe() {
        // Resolve authenticated user from SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null
                || "anonymousUser".equals(auth.getName())) {
            log.warn("SSE: unauthenticated connection attempt");
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) {
            log.warn("SSE: user not found for email {}", auth.getName());
            return ResponseEntity.status(401).build();
        }

        SseEmitter emitter = eventPublisher.addEmitter(user.getId());
        log.info("SSE: user {} connected", user.getId());

        // Send initial ping to confirm stream is alive
        eventPublisher.sendPing(user.getId());

        return ResponseEntity.ok()
                .header("Cache-Control", "no-cache")
                .header("X-Accel-Buffering", "no")  // Nginx: disable buffering
                .body(emitter);
    }
}
