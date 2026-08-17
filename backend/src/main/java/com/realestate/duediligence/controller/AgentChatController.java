package com.realestate.duediligence.controller;

import com.realestate.duediligence.service.AgentChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "AI Agent Chat",
        description = "Streaming AI chat for property due-diligence Q&A. " +
                "Powered by Groq LLM. Requires authentication.")
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
    @Operation(
            summary = "Stream AI chat response (SSE)",
            description = "Accepts a property ID, a user question, and conversation history. " +
                    "Streams the AI response token-by-token as Server-Sent Events. " +
                    "Each SSE data field is Base64-encoded to preserve whitespace and special characters. " +
                    "The stream ends with a final SSE completion event. " +
                    "Keep-alive timeout: 5 minutes. Re-connect on disconnect.")
    @ApiResponses({
            @ApiResponse(responseCode = "200",
                    description = "SSE stream opened — tokens delivered as Base64-encoded data events"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "500", description = "LLM service unavailable or internal error " +
                    "(error text streamed in final event before close)")
    })
    public SseEmitter streamChat(
            @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

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
                agentChatService.streamChat(request.propertyId(), request.question(), history)
                        .subscribe(
                                token -> {
                                    try {
                                        String encoded = Base64.getEncoder()
                                                .encodeToString(token.getBytes(StandardCharsets.UTF_8));
                                        emitter.send(SseEmitter.event().data(encoded));
                                    } catch (IOException | IllegalStateException e) {
                                        log.warn("[AgentChat] Client disconnected: {}", e.getMessage());
                                    }
                                },
                                error -> {
                                    log.error("[AgentChat] STREAM ERROR:", error);
                                    try {
                                        String detail = error.getMessage() != null
                                                ? error.getMessage()
                                                : error.getClass().getSimpleName();
                                        String encoded = Base64.getEncoder()
                                                .encodeToString(("\n\n[Error: " + detail + "]")
                                                        .getBytes(StandardCharsets.UTF_8));
                                        emitter.send(SseEmitter.event().data(encoded));
                                    } catch (IOException | IllegalStateException ignored) {}
                                    emitter.complete();
                                },
                                emitter::complete);
            } catch (Throwable t) {
                log.error("[AgentChat] FATAL:", t);
                try {
                    String encoded = Base64.getEncoder()
                            .encodeToString(("\n\n[Error: " + t.getClass().getSimpleName() + "]")
                                    .getBytes(StandardCharsets.UTF_8));
                    emitter.send(SseEmitter.event().data(encoded));
                } catch (IOException | IllegalStateException ignored) {}
                emitter.complete();
            }
        });

        emitter.onCompletion(() -> log.debug("[AgentChat] SSE completed for {}", userEmail));
        emitter.onTimeout(() -> { log.warn("[AgentChat] SSE timeout for {}", userEmail); emitter.complete(); });
        emitter.onError(err -> log.warn("[AgentChat] SSE error for {}: {}", userEmail, err.getMessage()));

        return emitter;
    }
}
