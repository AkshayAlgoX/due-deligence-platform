package com.realestate.duediligence.integration.impl.flood;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.integration.common.IntegrationResponse;
import com.realestate.duediligence.integration.flood.FloodZoneInfo;
import com.realestate.duediligence.integration.common.IndianCityCatalog;
import com.realestate.duediligence.integration.flood.FloodZoneProvider;

/**
 * Mock flood zone risk assessment.
 *
 * Why mock:
 *   NDMA (National Disaster Management Authority) and CWC (Central Water
 *   Commission) publish flood risk maps as PDFs. No structured public API.
 *
 * Real integration (future):
 *   - Bhuvan (ISRO) GIS layers
 *   - CWC flood forecasting portal
 *   - NDMA hazard atlas
 *   Would require GIS coordinate lookup on flood zone polygons.
 *
 * Mock assigns risk based on city (real flood-prone cities: Mumbai, Chennai,
 * Kolkata, Hyderabad) and property ID for variance.
 */
@Service
public class MockFloodZoneProvider implements FloodZoneProvider {

    private static final String SOURCE = "NDMA Flood Hazard (mock)";
    private static final String MOCK_REASON =
            "NDMA and CWC publish flood zone maps as PDFs, not structured APIs. " +
            "Real integration would need Bhuvan (ISRO) GIS layers with " +
            "coordinate-based polygon lookup.";

    @Override
    public IntegrationResponse<FloodZoneInfo> fetch(Property property) {
        long start = System.currentTimeMillis();
        if (!IndianCityCatalog.isIndian(property.getCity())) {
            long duration = System.currentTimeMillis() - start;
            return IntegrationResponse.<FloodZoneInfo>builder()
                    .status(com.realestate.duediligence.integration.common.IntegrationStatus.NO_DATA)
                    .dataSource(SOURCE)
                    .reason(IndianCityCatalog.nonIndianReason())
                    .retrievedAt(java.time.Instant.now())
                    .durationMs(duration)
                    .build();
        }

        try {
            Thread.sleep(110 + (property.getId() % 70));

            FloodZoneInfo info = generateFloodZone(property);
            long duration = System.currentTimeMillis() - start;

            return IntegrationResponse.mock(info, SOURCE, MOCK_REASON, duration);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return IntegrationResponse.error(SOURCE, "Interrupted", System.currentTimeMillis() - start);
        } catch (Exception e) {
            return IntegrationResponse.error(SOURCE, e.getMessage(), System.currentTimeMillis() - start);
        }
    }

    @Override
    public String providerName() {
        return "MockFloodZoneProvider";
    }

    private FloodZoneInfo generateFloodZone(Property property) {
        String city = property.getCity() != null ? property.getCity().toLowerCase() : "";
        Long id = property.getId();

        // Cities with historically high flood incidents
        boolean highRiskCity = city.contains("mumbai") || city.contains("chennai")
                || city.contains("kolkata") || city.contains("hyderabad")
                || city.contains("kochi") || city.contains("patna")
                || city.contains("guwahati");

        String zone;
        String risk;
        boolean insuranceReq;
        LocalDate lastFlood;

        if (highRiskCity && id % 3 == 0) {
            zone = "FLOOD_PRONE";
            risk = "HIGH";
            insuranceReq = true;
            lastFlood = LocalDate.now().minusYears(1).minusMonths((int) (id % 12));
        } else if (highRiskCity) {
            zone = "MODERATE_RISK";
            risk = "MEDIUM";
            insuranceReq = true;
            lastFlood = LocalDate.now().minusYears(3 + (int) (id % 5));
        } else if (id % 5 == 0) {
            zone = "MODERATE_RISK";
            risk = "MEDIUM";
            insuranceReq = false;
            lastFlood = LocalDate.now().minusYears(7 + (int) (id % 8));
        } else {
            zone = "LOW_RISK";
            risk = "LOW";
            insuranceReq = false;
            lastFlood = null;
        }

        return FloodZoneInfo.builder()
                .zoneClassification(zone)
                .riskLevel(risk)
                .insuranceRequired(insuranceReq)
                .nearestWaterBody(pickWaterBody(city))
                .distanceToWaterBodyMeters(500.0 + (id % 20) * 250.0)
                .lastMajorFloodDate(lastFlood)
                .dataAgency("NDMA / CWC")
                .build();
    }

    private String pickWaterBody(String city) {
        return switch (city) {
            case "bangalore", "bengaluru" -> "Bellandur Lake";
            case "mumbai" -> "Arabian Sea";
            case "chennai" -> "Cooum River";
            case "delhi", "new delhi" -> "Yamuna River";
            case "kolkata" -> "Hooghly River";
            case "hyderabad" -> "Hussain Sagar";
            case "pune" -> "Mula-Mutha River";
            case "ahmedabad" -> "Sabarmati River";
            case "kochi" -> "Vembanad Lake";
            default -> "Nearest water body";
        };
    }
}