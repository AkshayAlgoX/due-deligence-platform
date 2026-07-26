package com.realestate.duediligence.service.impl;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.service.GeocodingService;

import lombok.RequiredArgsConstructor;

/**
 * Nominatim-based geocoding service.
 *
 * Two entry points:
 *   1. geocodePropertyAsync(id) — fire-and-forget, runs in background thread
 *      Called after property save when lat/lon is missing.
 *   2. geocodeProperty(entity) — synchronous, for batch backfill
 *
 * Rate limit: Nominatim requires max 1 req/sec.
 * Async version uses 1s delay before request to spread load naturally.
 * Batch version uses 1.1s delay between requests.
 */
@Service
@RequiredArgsConstructor
public class GeocodingServiceImpl implements GeocodingService {

    private static final Logger log =
            LoggerFactory.getLogger(GeocodingServiceImpl.class);

    private final PropertyRepository propertyRepository;

    private static final String NOMINATIM_URL =
            "https://nominatim.openstreetmap.org/search";
    private static final String USER_AGENT =
            "DueDiligenceAgent/1.0 (real estate due diligence)";

    // ── Async single-property geocode ───────────────────────────
    @Override
    @Async
    @Transactional
    public void geocodePropertyAsync(Long propertyId) {
        try {
            // Brief pause so Nominatim doesn't get hit right after user save
            Thread.sleep(1000);

            Property p = propertyRepository.findById(propertyId).orElse(null);
            if (p == null) return;

            // Only geocode if still missing (user might have edited in the meantime)
            if (p.getLatitude() != null && p.getLongitude() != null) return;

            if (geocodeProperty(p)) {
                propertyRepository.save(p);
                log.info("Auto-geocoded property {} at {},{}",
                        p.getId(), p.getLatitude(), p.getLongitude());
            } else {
                log.info("Auto-geocode failed for property {} — address may be too vague",
                        p.getId());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.warn("Async geocode error for property {}: {}", propertyId, e.getMessage());
        }
    }

    // ── Synchronous geocode (used by batch + async) ─────────────
    @Override
    public boolean geocodeProperty(Property p) {
        try {
            String q = buildQuery(p);
            if (q.isBlank()) return false;

            String url = NOMINATIM_URL + "?q="
                    + URLEncoder.encode(q, StandardCharsets.UTF_8)
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

            HttpResponse<String> resp = http.send(req,
                    HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() != 200) return false;

            String body = resp.body();
            Double lat = extractJsonNumber(body, "\"lat\":\"");
            Double lon = extractJsonNumber(body, "\"lon\":\"");

            if (lat != null && lon != null) {
                p.setLatitude(lat);
                p.setLongitude(lon);
                return true;
            }
            return false;

        } catch (Exception e) {
            return false;
        }
    }

    // ── Helpers ─────────────────────────────────────────────────
    private String buildQuery(Property p) {
        return String.join(", ",
                nullSafe(p.getAddress()),
                nullSafe(p.getCity()),
                nullSafe(p.getState())
        ).replaceAll(", +", ", ").replaceAll("^, +", "").trim();
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }

    private Double extractJsonNumber(String json, String marker) {
        int idx = json.indexOf(marker);
        if (idx < 0) return null;
        int start = idx + marker.length();
        int end = json.indexOf("\"", start);
        if (end < 0) return null;
        try {
            return Double.parseDouble(json.substring(start, end));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}