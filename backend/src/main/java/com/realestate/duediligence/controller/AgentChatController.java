package com.realestate.duediligence.controller;

import com.realestate.duediligence.service.AgentChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentChatController {

    private final AgentChatService agentChatService;

    private static final ExecutorService CHAT_EXECUTOR = Executors.newCachedThreadPool(new ThreadFactory() {
        private final AtomicLong counter = new AtomicLong();
        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r, "agent-chat-" + counter.incrementAndGet());
            t.setDaemon(true);
            return t;
        }
    });

    public record ChatRequest(
            Long propertyId,
            String question,
            List<AgentChatService.MessageDto> history
    ) {}

    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(
            @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userEmail = userDetails != null ? userDetails.getUsername() : "anonymous";
        log.info("[AgentChat] User={} propertyId={} question={}",
                userEmail,
                request.propertyId(),
                request.question() != null
                        ? request.question().substring(0, Math.min(50, request.question().length()))
                        : "");

        SseEmitter emitter = new SseEmitter(300_000L);

        List<AgentChatService.MessageDto> history =
                request.history() != null ? request.history() : List.of();

        CHAT_EXECUTOR.execute(() -> {
            try {
                agentChatService.streamChat(
                        request.propertyId(),
                        request.question(),
                        history
                ).subscribe(
                        token -> {
                            try {
                                // ⭐ Base64-encode each token to preserve whitespace, newlines,
                                // and special chars through SSE serialization.
                                String encoded = Base64.getEncoder()
                                        .encodeToString(token.getBytes(StandardCharsets.UTF_8));
                                emitter.send(SseEmitter.event().data(encoded));
                            } catch (IOException | IllegalStateException e) {
                                log.warn("[AgentChat] Client disconnected: {}", e.getMessage());
                            }
                        },
                        error -> {
                            log.error("[AgentChat] STREAM ERROR — FULL STACK:", error);
                            try {
                                String detail = error.getMessage() != null
                                        ? error.getMessage()
                                        : error.getClass().getSimpleName();
                                String errText = "\n\n[Error: " + detail + "]";
                                String encoded = Base64.getEncoder()
                                        .encodeToString(errText.getBytes(StandardCharsets.UTF_8));
                                emitter.send(SseEmitter.event().data(encoded));
                            } catch (IOException | IllegalStateException ignored) {
                                log.debug("[AgentChat] Could not send error event — client gone");
                            }
                            emitter.complete();
                        },
                        emitter::complete
                );
            } catch (Throwable t) {
                log.error("[AgentChat] FATAL — FULL STACK:", t);
                try {
                    String errText = "\n\n[Error: " + t.getClass().getSimpleName() + "]";
                    String encoded = Base64.getEncoder()
                            .encodeToString(errText.getBytes(StandardCharsets.UTF_8));
                    emitter.send(SseEmitter.event().data(encoded));
                } catch (IOException | IllegalStateException ignored) {
                    log.debug("[AgentChat] Could not send fatal event — client gone");
                }
                emitter.complete();
            }
        });

        emitter.onCompletion(() -> log.debug("[AgentChat] SSE completed for {}", userEmail));
        emitter.onTimeout(() -> {
            log.warn("[AgentChat] SSE timeout for {}", userEmail);
            emitter.complete();
        });
        emitter.onError(err -> log.warn("[AgentChat] SSE error for {}: {}", userEmail, err.getMessage()));

        return emitter;
    }
}