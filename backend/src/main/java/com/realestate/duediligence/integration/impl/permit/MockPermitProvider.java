package com.realestate.duediligence.integration.impl.permit;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.integration.common.IntegrationResponse;
import com.realestate.duediligence.integration.permit.PermitProvider;
import com.realestate.duediligence.integration.permit.PermitRecord;
import com.realestate.duediligence.integration.common.IndianCityCatalog;

/**
 * Mock building & renovation permits.
 *
 * Why mock:
 *   Building permit records live in municipality-specific portals
 *   (BBMP e-Aasthi, MCGM MCA, MCD BPMS). No unified API for India.
 *
 * Real integration (future):
 *   - BBMP e-Aasthi (Bangalore)
 *   - MCGM (Mumbai) online building permit
 *   - MCD BPMS (Delhi)
 */
@Service
public class MockPermitProvider implements PermitProvider {

    private static final String SOURCE = "Municipal Permits (mock)";
    private static final String MOCK_REASON =
            "Building permit records exist in municipality-specific portals " +
            "(BBMP e-Aasthi, MCGM, MCD BPMS). No unified public API for India.";

    @Override
    public IntegrationResponse<List<PermitRecord>> fetch(Property property) {
        long start = System.currentTimeMillis();
        if (!IndianCityCatalog.isIndian(property.getCity())) {
            long duration = System.currentTimeMillis() - start;
            return IntegrationResponse.<List<PermitRecord>>builder()
                    .status(com.realestate.duediligence.integration.common.IntegrationStatus.NO_DATA)
                    .dataSource(SOURCE)
                    .reason(IndianCityCatalog.nonIndianReason())
                    .retrievedAt(java.time.Instant.now())
                    .durationMs(duration)
                    .build();
        }

        try {
            Thread.sleep(100 + (property.getId() % 80));

            List<PermitRecord> permits = generatePermits(property);
            long duration = System.currentTimeMillis() - start;

            return IntegrationResponse.mock(permits, SOURCE, MOCK_REASON, duration);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return IntegrationResponse.error(SOURCE, "Interrupted", System.currentTimeMillis() - start);
        } catch (Exception e) {
            return IntegrationResponse.error(SOURCE, e.getMessage(), System.currentTimeMillis() - start);
        }
    }

    @Override
    public String providerName() {
        return "MockPermitProvider";
    }

    private List<PermitRecord> generatePermits(Property property) {
        Long id = property.getId();
        String authority = pickAuthority(property.getCity());
        Integer yearBuilt = property.getYearBuilt() != null ? property.getYearBuilt() : 2010;

        List<PermitRecord> permits = new ArrayList<>();

        // Every property has an original building permit
        permits.add(PermitRecord.builder()
                .permitType("BUILDING")
                .permitNumber(String.format("BP/%s/%d/%04d", codeFor(authority), yearBuilt, 1000 + id))
                .status("APPROVED")
                .issueDate(LocalDate.of(yearBuilt, 3, 15))
                .expiryDate(LocalDate.of(yearBuilt, 3, 15).plusYears(3))
                .issuingAuthority(authority)
                .description("Original building construction permit")
                .build());

        // Occupancy certificate (issued after construction complete)
        if (id % 5 != 0) { // 80% have OC
            permits.add(PermitRecord.builder()
                    .permitType("OCCUPANCY")
                    .permitNumber(String.format("OC/%s/%d/%04d", codeFor(authority), yearBuilt + 1, 2000 + id))
                    .status("APPROVED")
                    .issueDate(LocalDate.of(yearBuilt + 1, 8, 10))
                    .expiryDate(null)  // OC doesn't expire
                    .issuingAuthority(authority)
                    .description("Occupancy certificate")
                    .build());
        }

        // Renovation permit if property is older
        if (yearBuilt < 2015 && id % 3 == 0) {
            permits.add(PermitRecord.builder()
                    .permitType("RENOVATION")
                    .permitNumber(String.format("RN/%s/2022/%04d", codeFor(authority), 3000 + id))
                    .status("APPROVED")
                    .issueDate(LocalDate.of(2022, 6, 20))
                    .expiryDate(LocalDate.of(2023, 6, 20))
                    .issuingAuthority(authority)
                    .description("Interior renovation and structural modification")
                    .build());
        }

        return permits;
    }

    private String pickAuthority(String city) {
        if (city == null) return "Municipal Corporation";
        return switch (city.toLowerCase()) {
            case "bangalore", "bengaluru" -> "BBMP";
            case "mumbai" -> "MCGM";
            case "delhi", "new delhi" -> "MCD";
            case "chennai" -> "GCC";
            case "hyderabad" -> "GHMC";
            case "pune" -> "PMC";
            case "kolkata" -> "KMC";
            default -> city + " Municipal Corp";
        };
    }

    private String codeFor(String authority) {
        return authority.replaceAll("[^A-Z]", "");
    }
}