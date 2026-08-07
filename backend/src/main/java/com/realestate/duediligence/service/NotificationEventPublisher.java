package com.realestate.duediligence.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.duediligence.dto.NotificationDto;

/**
 * Manages active SSE connections and broadcasts notifications in real-time.
 *
 * Design:
 *  - ConcurrentHashMap<userId, List<SseEmitter>> — supports multiple tabs per user
 *  - CopyOnWriteArrayList — safe iteration while sends happen on different threads
 *  - Dead emitters are removed after failed sends (no memory leak)
 *  - Sends are best-effort: a failed send does not rollback the DB write
 *
 * Thread-safety:
 *  - addEmitter / removeEmitter / publish may be called from different threads
 *    (HTTP thread for add/remove, async reportTaskExecutor for publish)
 *  - ConcurrentHashMap + CopyOnWriteArrayList make this safe
 */
@Component
public class NotificationEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventPublisher.class);

    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public NotificationEventPublisher(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Register a new SSE connection for the given user.
     * Called by SseController when a client connects.
     */
    public SseEmitter addEmitter(Long userId) {
        // 30 minutes timeout — client reconnects automatically if it closes
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitters.computeIfAbsent(userId, id -> new CopyOnWriteArrayList<>()).add(emitter);
        log.debug("SSE: added emitter for user {} — {} active connections",
                userId, emitters.get(userId).size());

        // Clean up on completion / timeout / error
        Runnable cleanup = () -> removeEmitter(userId, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> {
            log.debug("SSE: emitter error for user {}: {}", userId, e.getMessage());
            cleanup.run();
        });

        return emitter;
    }

    /**
     * Remove a specific emitter for a user.
     */
    public void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters != null) {
            userEmitters.remove(emitter);
            if (userEmitters.isEmpty()) {
                emitters.remove(userId);
            }
            log.debug("SSE: removed emitter for user {}", userId);
        }
    }

    /**
     * Push a notification to all active SSE connections for a user.
     * Dead connections are automatically cleaned up.
     *
     * @param userId          target user
     * @param notification    the notification to broadcast
     */
    public void publish(Long userId, NotificationDto notification) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) {
            log.debug("SSE: no active connections for user {} — skipping SSE push", userId);
            return;
        }

        String payload;
        try {
            payload = objectMapper.writeValueAsString(notification);
        } catch (Exception e) {
            log.error("SSE: failed to serialize notification for user {}: {}", userId, e.getMessage());
            return;
        }

        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(payload));
                log.debug("SSE: pushed notification {} to user {}", notification.getId(), userId);
            } catch (IOException e) {
                log.debug("SSE: dead emitter detected for user {}, marking for removal", userId);
                deadEmitters.add(emitter);
            }
        }

        // Clean up dead emitters after iteration (avoid ConcurrentModificationException)
        deadEmitters.forEach(dead -> removeEmitter(userId, dead));
    }

    /**
     * Broadcast a notification to all currently connected users.
     * Used for system-wide announcements.
     */
    public void publishToAll(NotificationDto notification) {
        emitters.keySet().forEach(userId -> publish(userId, notification));
    }

    /**
     * Send a keep-alive ping to a specific user's connections.
     * Called by SseController on connect to verify the stream works.
     */
    public void sendPing(Long userId) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null) return;

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event().name("ping").data("connected"));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }
        deadEmitters.forEach(dead -> removeEmitter(userId, dead));
    }

    /** Returns the number of active connections for monitoring/debug. */
    public int getActiveConnectionCount() {
        return emitters.values().stream().mapToInt(List::size).sum();
    }
}
