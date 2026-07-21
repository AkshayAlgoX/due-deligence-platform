package com.realestate.duediligence.integration.impl.zoning;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.integration.common.IndianCityCatalog;
import com.realestate.duediligence.integration.common.IntegrationResponse;
import com.realestate.duediligence.integration.zoning.ZoningInfo;
import com.realestate.duediligence.integration.zoning.ZoningProvider;

/**
 * Mock zoning information.
 *
 * Why mock:
 *   Zoning master plans (RMP, CDP, DMP) exist as PDF documents on
 *   city development authority websites. No structured API for zone lookup.
 *
 * Real integration (future):
 *   - BDA (Bengaluru), DDA (Delhi), MMRDA (Mumbai) publish plans as PDFs
 *   - Would require GIS layer + geocoding + polygon lookup
 *
 * Mock uses the property's own `zoning` field if set, else infers from propertyType.
 */
@Service
public class MockZoningProvider implements ZoningProvider {

    private static final String SOURCE = "City Development Authority (mock)";
    private static final String MOCK_REASON =
            "Zoning master plans are published as PDFs by city development " +
            "authorities (BDA, DDA, MMRDA). No structured public API exists. " +
            "Real integration would need GIS geocoding + polygon lookup.";

    @Override
    public IntegrationResponse<ZoningInfo> fetch(Property property) {
        long start = System.currentTimeMillis();
        if (!IndianCityCatalog.isIndian(property.getCity())) {
            long duration = System.currentTimeMillis() - start;
            return IntegrationResponse.<ZoningInfo>builder()
                    .status(com.realestate.duediligence.integration.common.IntegrationStatus.NO_DATA)
                    .dataSource(SOURCE)
                    .reason(IndianCityCatalog.nonIndianReason())
                    .retrievedAt(java.time.Instant.now())
                    .durationMs(duration)
                    .build();
        }

        try {
            Thread.sleep(90 + (property.getId() % 60));

            ZoningInfo info = generateZoning(property);
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
        return "MockZoningProvider";
    }

    private ZoningInfo generateZoning(Property property) {
        String type = property.getPropertyType() != null ? property.getPropertyType() : "Residential";
        String masterPlan = pickMasterPlan(property.getCity());

        return switch (type) {
            case "Commercial" -> ZoningInfo.builder()
                    .zoneCode("C-2")
                    .zoneCategory("COMMERCIAL")
                    .maxFAR(4.0)
                    .maxGroundCoverage(65.0)
                    .maxHeightMeters(45.0)
                    .allowedUses(List.of("Retail", "Office", "Hotel", "Restaurant"))
                    .restrictedUses(List.of("Manufacturing", "Warehousing"))
                    .masterPlanReference(masterPlan)
                    .build();

            case "Industrial" -> ZoningInfo.builder()
                    .zoneCode("I-2")
                    .zoneCategory("INDUSTRIAL")
                    .maxFAR(1.5)
                    .maxGroundCoverage(50.0)
                    .maxHeightMeters(25.0)
                    .allowedUses(List.of("Light manufacturing", "Warehousing", "Logistics"))
                    .restrictedUses(List.of("Residential", "School", "Hospital"))
                    .masterPlanReference(masterPlan)
                    .build();

            case "Land" -> ZoningInfo.builder()
                    .zoneCode("A-1")
                    .zoneCategory("AGRICULTURAL")
                    .maxFAR(0.25)
                    .maxGroundCoverage(15.0)
                    .maxHeightMeters(9.0)
                    .allowedUses(List.of("Agriculture", "Farmhouse", "Nursery"))
                    .restrictedUses(List.of("Commercial", "Industrial"))
                    .masterPlanReference(masterPlan)
                    .build();

            case "Mixed-Use" -> ZoningInfo.builder()
                    .zoneCode("MX-1")
                    .zoneCategory("MIXED_USE")
                    .maxFAR(3.25)
                    .maxGroundCoverage(60.0)
                    .maxHeightMeters(35.0)
                    .allowedUses(List.of("Residential", "Retail", "Office"))
                    .restrictedUses(List.of("Heavy industry", "Storage"))
                    .masterPlanReference(masterPlan)
                    .build();

            default -> ZoningInfo.builder()  // Residential
                    .zoneCode("R-2")
                    .zoneCategory("RESIDENTIAL")
                    .maxFAR(2.25)
                    .maxGroundCoverage(55.0)
                    .maxHeightMeters(18.0)
                    .allowedUses(List.of("Single family", "Multi-family", "Community facility"))
                    .restrictedUses(List.of("Commercial", "Industrial", "Warehousing"))
                    .masterPlanReference(masterPlan)
                    .build();
        };
    }

    private String pickMasterPlan(String city) {
        if (city == null) return "Local Development Plan";
        return switch (city.toLowerCase()) {
            case "bangalore", "bengaluru" -> "Bengaluru RMP 2031";
            case "mumbai" -> "Mumbai DP 2034";
            case "delhi", "new delhi" -> "Delhi Master Plan 2041";
            case "chennai" -> "Chennai CMDA Master Plan";
            case "hyderabad" -> "Hyderabad HMDA Master Plan 2031";
            case "pune" -> "Pune DP 2027";
            case "kolkata" -> "Kolkata KMDA Master Plan";
            default -> city + " Development Plan";
        };
    }
}