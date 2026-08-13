package com.realestate.duediligence.integration;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.realestate.duediligence.dto.IntegrationHealthStatus;

@Component
public class WAQIHealthCheck {

    private static final Logger log = LoggerFactory.getLogger(WAQIHealthCheck.class);
    private static final String WAQI_BASE = "https://api.waqi.info";
    private static final Duration TIMEOUT = Duration.ofSeconds(4);
    private static final String TEST_CITY = "Delhi";

    private final WebClient webClient;
    private final String token;

    public WAQIHealthCheck(@Value("${WAQI_TOKEN:demo}") String token) {
        this.token = token;
        this.webClient = WebClient.builder().baseUrl(WAQI_BASE).build();
    }

    public IntegrationHealthStatus check() {
        long start = System.currentTimeMillis();
        try {
            String body = webClient.get()
                    .uri("/feed/{city}/?token={token}", TEST_CITY, token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            long duration = System.currentTimeMillis() - start;

            if (body != null && body.contains("\"status\":\"ok\"")) {
                return IntegrationHealthStatus.up(
                        "WAQI (Air Quality Index)", duration,
                        "demo".equals(token)
                                ? "Reachable — using demo token (limited access)"
                                : "Reachable — configured token active");
            }

            return IntegrationHealthStatus.down(
                    "WAQI (Air Quality Index)", duration,
                    "Reached WAQI but response was not status=ok");

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            log.warn("WAQI health check failed: {}", e.getMessage());
            return IntegrationHealthStatus.down(
                    "WAQI (Air Quality Index)", duration, "Unreachable: " + e.getMessage());
        }
    }
}