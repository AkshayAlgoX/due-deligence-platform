package com.realestate.duediligence.integration.impl.ownership;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.integration.common.IndianCityCatalog;
import com.realestate.duediligence.integration.common.IntegrationResponse;
import com.realestate.duediligence.integration.ownership.OwnershipProvider;
import com.realestate.duediligence.integration.ownership.OwnershipRecord;
import com.realestate.duediligence.integration.ownership.OwnershipRecord.PreviousOwner;

/**
 * REFERENCE IMPLEMENTATION — pattern for all other mock providers.
 *
 * Why mock:
 *   Indian land registry data is NOT available via public API.
 *   Karnataka, Maharashtra, Delhi have separate portals — all PDF-only, no structured API.
 *   When a real API becomes available, create a LiveOwnershipProvider
 *   with @Primary annotation, and this mock becomes the fallback.
 *
 * How mock data is generated:
 *   - Deterministic (same propertyId → same data, so demo is repeatable)
 *   - Realistic (uses real Indian sub-registrar office names)
 *   - Honest (response tagged MOCK with clear reason)
 */
@Service
public class MockOwnershipProvider implements OwnershipProvider {

    private static final String SOURCE = "Indian Land Registry (mock)";
    private static final String MOCK_REASON =
            "Public land registry API not available for India. " +
            "Real integration would use state-specific portals " +
            "(Karnataka Bhoomi, Maharashtra 7/12, Delhi DORIS).";

    @Override
    public IntegrationResponse<OwnershipRecord> fetch(Property property) {
        long start = System.currentTimeMillis();

        // India-only: skip mock data for non-Indian cities (avoids misleading fake data)
        if (!IndianCityCatalog.isIndian(property.getCity())) {
            long duration = System.currentTimeMillis() - start;
            return IntegrationResponse.<OwnershipRecord>builder()
                    .status(com.realestate.duediligence.integration.common.IntegrationStatus.NO_DATA)
                    .dataSource(SOURCE)
                    .reason(IndianCityCatalog.nonIndianReason())
                    .retrievedAt(java.time.Instant.now())
                    .durationMs(duration)
                    .build();
        }

        try {
            // Simulate small network delay (realistic timing for demo)
            Thread.sleep(100 + (property.getId() % 100));

            OwnershipRecord record = generateMockRecord(property);
            long duration = System.currentTimeMillis() - start;

            return IntegrationResponse.mock(record, SOURCE, MOCK_REASON, duration);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            long duration = System.currentTimeMillis() - start;
            return IntegrationResponse.error(SOURCE, "Interrupted", duration);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            return IntegrationResponse.error(SOURCE, e.getMessage(), duration);
        }
    }

    @Override
    public String providerName() {
        return "MockOwnershipProvider";
    }

    // ── Deterministic mock data generation ──────────────────────────

    private OwnershipRecord generateMockRecord(Property property) {
        Long id = property.getId();
        String city = property.getCity() != null ? property.getCity() : "Bangalore";

        return OwnershipRecord.builder()
                .currentOwner(pickOwner(id))
                .coOwners(pickCoOwners(id))
                .ownershipType(pickOwnershipType(id))
                .registrationDate(LocalDate.now().minusYears(2 + (id % 8)))
                .registrationNumber(String.format("REG/%s/%04d/%d",
                        cityCode(city), 2020 + (id % 5), 1000 + id))
                .subRegistrarOffice(pickSubRegistrar(city))
                .registeredValue(property.getMarketValue() != null
                        ? property.getMarketValue() * 0.85
                        : null)
                .stampDutyPaid(property.getMarketValue() != null
                        ? property.getMarketValue() * 0.056
                        : null)
                .documentUrl(null) // no real doc for mock
                .ownershipHistory(generateHistory(id))
                .build();
    }

    private String pickOwner(Long id) {
        String[] owners = {
                "Rajesh Kumar Sharma",
                "Priya Venkatesh",
                "Mohammed Iqbal Khan",
                "Anita Ramachandran",
                "Vikram Singh Chauhan",
                "Meera Krishnamurthy",
                "Arjun Reddy",
                "Sneha Iyer"
        };
        return owners[(int) (id % owners.length)];
    }

    private List<String> pickCoOwners(Long id) {
        if (id % 3 == 0) return List.of(); // 33% have no co-owners
        String[] coOwners = {
                "Sunita Sharma", "Ramesh Kumar", "Deepa Nair", "Kiran Rao"
        };
        return List.of(coOwners[(int) (id % coOwners.length)]);
    }

    private String pickOwnershipType(Long id) {
        String[] types = {"FREEHOLD", "LEASEHOLD", "COOPERATIVE_SOCIETY"};
        return types[(int) (id % types.length)];
    }

    private String pickSubRegistrar(String city) {
        return switch (city.toLowerCase()) {
            case "bangalore", "bengaluru" -> "Sub-Registrar Office, Shivajinagar, Bengaluru";
            case "mumbai" -> "Sub-Registrar Office, Bandra, Mumbai";
            case "delhi", "new delhi" -> "Sub-Registrar Office, Kashmere Gate, Delhi";
            case "chennai" -> "Sub-Registrar Office, T. Nagar, Chennai";
            case "hyderabad" -> "Sub-Registrar Office, Banjara Hills, Hyderabad";
            case "pune" -> "Sub-Registrar Office, Shivajinagar, Pune";
            case "kolkata" -> "Sub-Registrar Office, Alipore, Kolkata";
            default -> "Sub-Registrar Office, " + city;
        };
    }

    private String cityCode(String city) {
        return switch (city.toLowerCase()) {
            case "bangalore", "bengaluru" -> "BLR";
            case "mumbai" -> "MUM";
            case "delhi", "new delhi" -> "DEL";
            case "chennai" -> "CHN";
            case "hyderabad" -> "HYD";
            case "pune" -> "PUN";
            case "kolkata" -> "KOL";
            default -> "IND";
        };
    }

    private List<PreviousOwner> generateHistory(Long id) {
        if (id % 4 == 0) return List.of(); // 25% brand new
        return List.of(
                PreviousOwner.builder()
                        .ownerName("Suresh Patel")
                        .ownedFrom(LocalDate.now().minusYears(15))
                        .ownedUntil(LocalDate.now().minusYears(3))
                        .transferReason("SALE")
                        .build()
        );
    }
}