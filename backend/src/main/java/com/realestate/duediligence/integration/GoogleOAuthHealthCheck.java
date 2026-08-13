package com.realestate.duediligence.integration;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.realestate.duediligence.dto.IntegrationHealthStatus;

@Component
public class GoogleOAuthHealthCheck {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthHealthCheck.class);
    private static final String GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";

    private final String clientId;

    public GoogleOAuthHealthCheck(@Value("${google.oauth.client-id:}") String clientId) {
        this.clientId = clientId;
    }

    public IntegrationHealthStatus check() {
        long start = System.currentTimeMillis();

        if (clientId == null || clientId.isBlank()) {
            long duration = System.currentTimeMillis() - start;
            return IntegrationHealthStatus.down(
                    "Google OAuth", duration, "google.oauth.client-id is not configured");
        }

        try {
            HttpClient http = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .build();

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(GOOGLE_CERTS_URL))
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            long duration = System.currentTimeMillis() - start;

            if (resp.statusCode() == 200) {
                return IntegrationHealthStatus.up(
                        "Google OAuth", duration,
                        "Client ID configured, Google certs endpoint reachable");
            }

            return IntegrationHealthStatus.down(
                    "Google OAuth", duration,
                    "Google certs endpoint returned HTTP " + resp.statusCode());

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            log.warn("Google OAuth health check failed: {}", e.getMessage());
            return IntegrationHealthStatus.down(
                    "Google OAuth", duration, "Unreachable: " + e.getMessage());
        }
    }
}