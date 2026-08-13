package com.realestate.duediligence.dto;

import java.time.Instant;

public record IntegrationHealthStatus(
        String name,
        String status,          // "UP" or "DOWN"
        long responseTimeMs,
        String message,
        Instant checkedAt
) {
    public static IntegrationHealthStatus up(String name, long responseTimeMs, String message) {
        return new IntegrationHealthStatus(name, "UP", responseTimeMs, message, Instant.now());
    }

    public static IntegrationHealthStatus down(String name, long responseTimeMs, String message) {
        return new IntegrationHealthStatus(name, "DOWN", responseTimeMs, message, Instant.now());
    }
}