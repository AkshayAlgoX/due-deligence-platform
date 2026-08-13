package com.realestate.duediligence.integration;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.realestate.duediligence.dto.IntegrationHealthStatus;

@Component
public class NominatimHealthCheck {

    private static final Logger log = LoggerFactory.getLogger(NominatimHealthCheck.class);
    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
    private static final String USER_AGENT = "DueDiligenceAgent/1.0 (real estate due diligence)";
    private static final String TEST_QUERY = "New Delhi, India";

    public IntegrationHealthStatus check() {
        long start = System.currentTimeMillis();
        try {
            String url = NOMINATIM_URL + "?q="
                    + URLEncoder.encode(TEST_QUERY, StandardCharsets.UTF_8)
                    + "&format=json&limit=1&countrycodes=in";

            HttpClient http = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .build();

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", USER_AGENT)
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            long duration = System.currentTimeMillis() - start;

            if (resp.statusCode() == 200 && resp.body() != null && resp.body().trim().length() > 2) {
                return IntegrationHealthStatus.up(
                        "Nominatim (Geocoding)", duration, "Reachable and returning results");
            }

            return IntegrationHealthStatus.down(
                    "Nominatim (Geocoding)", duration,
                    "Unexpected response: HTTP " + resp.statusCode());

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            log.warn("Nominatim health check failed: {}", e.getMessage());
            return IntegrationHealthStatus.down(
                    "Nominatim (Geocoding)", duration, "Unreachable: " + e.getMessage());
        }
    }
}