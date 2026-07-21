package com.realestate.duediligence.integration.impl.environmental;

import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.integration.common.IntegrationResponse;
import com.realestate.duediligence.integration.environmental.EnvironmentalInfo;
import com.realestate.duediligence.integration.environmental.EnvironmentalProvider;

/**
 * REAL LIVE INTEGRATION — Air Quality Index.
 *
 * Uses WAQI (World Air Quality Index) public API, which aggregates CPCB
 * (Central Pollution Control Board, India) station data.
 * https://aqicn.org/api/
 *
 * Token config:
 *   Reads WAQI_TOKEN from environment / .env.
 *   Falls back to "demo" token (very limited) if unset.
 *   Register free token: https://aqicn.org/data-platform/token/
 *
 * Sanity checks:
 *   - Station name must match the requested city (or be a known alias)
 *   - If station is in a different country → return MOCK, not LIVE
 *   Prevents WAQI's demo endpoint from returning random global stations.
 *
 * Non-AQI fields (soil, green cover, noise) remain mock — no free public
 * APIs exist for those in India.
 */
@Service
public class CpcbEnvironmentalProvider implements EnvironmentalProvider {

    private static final Logger log = LoggerFactory.getLogger(CpcbEnvironmentalProvider.class);
    private static final String WAQI_BASE = "https://api.waqi.info";
    private static final Duration TIMEOUT = Duration.ofSeconds(4);

    private static final String SOURCE_LIVE = "WAQI (CPCB aggregated live data)";
    private static final String SOURCE_MOCK = "Environmental data (mock fallback)";

    private final WebClient webClient;
    private final String token;

    public CpcbEnvironmentalProvider(
            @Value("${WAQI_TOKEN:demo}") String token) {
        this.token = token;
        this.webClient = WebClient.builder()
                .baseUrl(WAQI_BASE)
                .build();

        if ("demo".equals(token)) {
            log.warn("WAQI_TOKEN not set — using demo token with limited access. " +
                     "Register free token at https://aqicn.org/data-platform/token/");
        } else {
            log.info("WAQI live integration initialized with configured token.");
        }
    }

    @Override
    public IntegrationResponse<EnvironmentalInfo> fetch(Property property) {
        long start = System.currentTimeMillis();
        String city = property.getCity();

        if (city == null || city.isBlank()) {
            long duration = System.currentTimeMillis() - start;
            return IntegrationResponse.noData(SOURCE_LIVE, duration);
        }

        try {
            WaqiResponse response = webClient.get()
                    .uri("/feed/{city}/?token={token}", city, token)
                    .retrieve()
                    .bodyToMono(WaqiResponse.class)
                    .timeout(TIMEOUT)
                    .block();

            long duration = System.currentTimeMillis() - start;

            if (response == null || !"ok".equals(response.status) || response.data == null) {
                return IntegrationResponse.mock(
                        mockFallback(property),
                        SOURCE_MOCK,
                        "WAQI returned no data for city: " + city,
                        duration);
            }

            // Sanity check: does the returned station actually match the requested city?
            if (!stationMatchesCity(response, city)) {
                String returnedStation = response.data.city != null && response.data.city.name != null
                        ? response.data.city.name
                        : "unknown";
                log.warn("WAQI returned unrelated station '{}' for city '{}' — falling back to mock",
                        returnedStation, city);
                return IntegrationResponse.mock(
                        mockFallback(property),
                        SOURCE_MOCK,
                        "WAQI returned station from different location: " + returnedStation,
                        duration);
            }

            EnvironmentalInfo info = mapFromWaqi(response, property);
            return IntegrationResponse.live(info, SOURCE_LIVE, duration);

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            log.warn("WAQI call failed for {}: {}", city, e.getMessage());
            return IntegrationResponse.mock(
                    mockFallback(property),
                    SOURCE_MOCK,
                    "Live API unreachable: " + e.getMessage(),
                    duration);
        }
    }

    @Override
    public String providerName() {
        return "CpcbEnvironmentalProvider";
    }

    // ── Station location sanity check ─────────────────────────────

    private boolean stationMatchesCity(WaqiResponse response, String requestedCity) {
        if (response.data == null || response.data.city == null || response.data.city.name == null) {
            return false;
        }
        String stationName = response.data.city.name.toLowerCase();
        String city = requestedCity.toLowerCase();

        // Direct match
        if (stationName.contains(city)) return true;

        // Common city name aliases
        if (city.equals("bangalore") && stationName.contains("bengaluru")) return true;
        if (city.equals("bengaluru") && stationName.contains("bangalore")) return true;
        if (city.equals("mumbai") && stationName.contains("bombay")) return true;
        if (city.equals("kolkata") && stationName.contains("calcutta")) return true;
        if (city.equals("chennai") && stationName.contains("madras")) return true;

        // Station name explicitly mentions India → accept for major Indian cities
        if (stationName.contains("india") && isMajorIndianCity(city)) return true;

        return false;
    }

    private boolean isMajorIndianCity(String city) {
        return switch (city) {
            case "bangalore", "bengaluru", "mumbai", "delhi", "new delhi",
                 "chennai", "hyderabad", "pune", "kolkata", "ahmedabad",
                 "jaipur", "lucknow", "kanpur", "patna", "kochi",
                 "surat", "indore", "nagpur", "bhopal", "vadodara",
                 "coimbatore", "vizag", "visakhapatnam", "thiruvananthapuram" -> true;
            default -> false;
        };
    }

    // ── Map WAQI response → our DTO ────────────────────────────────

    private EnvironmentalInfo mapFromWaqi(WaqiResponse response, Property property) {
        Integer aqi = response.data.aqi;
        String category = categorizeAqi(aqi);
        String pollutant = response.data.dominentpol != null
                ? response.data.dominentpol.toUpperCase()
                : "PM2.5";
        String stationName = response.data.city != null && response.data.city.name != null
                ? response.data.city.name
                : property.getCity();

        return EnvironmentalInfo.builder()
                .airQualityIndex(aqi)
                .aqiCategory(category)
                .dominantPollutant(pollutant)
                .nearestStation(stationName)
                .stationDistanceKm(null)
                .measuredAt(Instant.now())
                .soilType(mockSoil(property))
                .greenCoveragePercent(mockGreenCover(property))
                .noiseLevelDb(mockNoise(property, aqi))
                .nearIndustrialZone(property.getPropertyType() != null
                        && property.getPropertyType().equals("Industrial"))
                .build();
    }

    private String categorizeAqi(Integer aqi) {
        if (aqi == null) return "UNKNOWN";
        if (aqi <= 50) return "GOOD";
        if (aqi <= 100) return "SATISFACTORY";
        if (aqi <= 200) return "MODERATE";
        if (aqi <= 300) return "POOR";
        if (aqi <= 400) return "VERY_POOR";
        return "SEVERE";
    }

    // ── Fallback mock data (used when WAQI unavailable) ────────────

    private EnvironmentalInfo mockFallback(Property property) {
        Long id = property.getId();
        String city = property.getCity() != null ? property.getCity().toLowerCase() : "";

        int aqi = switch (city) {
            case "delhi", "new delhi" -> 250 + (int) (id % 100);
            case "kolkata" -> 180 + (int) (id % 60);
            case "mumbai" -> 140 + (int) (id % 50);
            case "kanpur", "lucknow", "patna" -> 220 + (int) (id % 80);
            case "hyderabad", "chennai", "pune" -> 110 + (int) (id % 40);
            case "bangalore", "bengaluru" -> 90 + (int) (id % 30);
            default -> 120 + (int) (id % 40);
        };

        return EnvironmentalInfo.builder()
                .airQualityIndex(aqi)
                .aqiCategory(categorizeAqi(aqi))
                .dominantPollutant("PM2.5")
                .nearestStation(property.getCity() + " (estimated)")
                .stationDistanceKm(null)
                .measuredAt(Instant.now())
                .soilType(mockSoil(property))
                .greenCoveragePercent(mockGreenCover(property))
                .noiseLevelDb(mockNoise(property, aqi))
                .nearIndustrialZone(property.getPropertyType() != null
                        && property.getPropertyType().equals("Industrial"))
                .build();
    }

    private String mockSoil(Property property) {
        Long id = property.getId();
        String[] soils = {"ALLUVIAL", "RED_LATERITE", "BLACK_COTTON", "SANDY_LOAM"};
        return soils[(int) (id % soils.length)];
    }

    private Double mockGreenCover(Property property) {
        Long id = property.getId();
        String city = property.getCity() != null ? property.getCity().toLowerCase() : "";
        double base = switch (city) {
            case "bangalore", "bengaluru" -> 28.0;
            case "delhi", "new delhi" -> 20.0;
            case "mumbai" -> 12.0;
            case "chennai" -> 15.0;
            default -> 18.0;
        };
        return Math.round((base + (id % 10) - 5) * 10.0) / 10.0;
    }

    private Integer mockNoise(Property property, Integer aqi) {
        int base = aqi != null && aqi > 150 ? 68 : 58;
        return base + (int) (property.getId() % 10);
    }

    // ── WAQI response DTO ──────────────────────────────────────────

    public static class WaqiResponse {
        public String status;
        public WaqiData data;
    }

    public static class WaqiData {
        public Integer aqi;
        public String dominentpol;
        public WaqiCity city;
    }

    public static class WaqiCity {
        public String name;
    }
}