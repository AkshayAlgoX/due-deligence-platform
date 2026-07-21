package com.realestate.duediligence.integration.impl.tax;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.integration.common.IndianCityCatalog;
import com.realestate.duediligence.integration.common.IntegrationResponse;
import com.realestate.duediligence.integration.tax.TaxHistoryProvider;
import com.realestate.duediligence.integration.tax.TaxRecord;

/**
 * Mock property tax history.
 *
 * Why mock:
 *   Municipal property tax data (BBMP, MCGM, MCD, KMC) sits on individual
 *   city portals with login gates or CAPTCHA. No unified public API for India.
 *
 * Real integration path (future):
 *   - BBMP: https://bbmptax.karnataka.gov.in (Bangalore)
 *   - MCGM: https://ptaxportal.mcgm.gov.in (Mumbai)
 *   - MCD:  https://mcdonline.nic.in (Delhi)
 *
 * Mock returns last 5 assessment years, deterministic per property.
 */
@Service
public class MockTaxHistoryProvider implements TaxHistoryProvider {

    private static final String SOURCE = "Municipal Property Tax (mock)";
    private static final String MOCK_REASON =
            "Municipal tax portals (BBMP, MCGM, MCD) have no public API. " +
            "Real integration would require per-city portal scraping or " +
            "partnerships with municipal corporations.";

    @Override
    public IntegrationResponse<List<TaxRecord>> fetch(Property property) {
        long start = System.currentTimeMillis();
        if (!IndianCityCatalog.isIndian(property.getCity())) {
            long duration = System.currentTimeMillis() - start;
            return IntegrationResponse.<List<TaxRecord>>builder()
                    .status(com.realestate.duediligence.integration.common.IntegrationStatus.NO_DATA)
                    .dataSource(SOURCE)
                    .reason(IndianCityCatalog.nonIndianReason())
                    .retrievedAt(java.time.Instant.now())
                    .durationMs(duration)
                    .build();
        }

        try {
            Thread.sleep(120 + (property.getId() % 80));

            List<TaxRecord> records = generateTaxHistory(property);
            long duration = System.currentTimeMillis() - start;

            return IntegrationResponse.mock(records, SOURCE, MOCK_REASON, duration);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return IntegrationResponse.error(SOURCE, "Interrupted", System.currentTimeMillis() - start);
        } catch (Exception e) {
            return IntegrationResponse.error(SOURCE, e.getMessage(), System.currentTimeMillis() - start);
        }
    }

    @Override
    public String providerName() {
        return "MockTaxHistoryProvider";
    }

    // ── Generate last 5 years of tax records ───────────────────────

    private List<TaxRecord> generateTaxHistory(Property property) {
        Long id = property.getId();
        String municipality = pickMunicipality(property.getCity());
        Double marketValue = property.getMarketValue() != null ? property.getMarketValue() : 5_000_000d;

        List<TaxRecord> records = new ArrayList<>();
        int currentYear = LocalDate.now().getYear();

        for (int i = 0; i < 5; i++) {
            int year = currentYear - i;
            // Assessed value = 60-70% of market value (typical for India)
            double assessedValue = marketValue * (0.60 + (id % 10) * 0.01);
            // Tax rate = 0.2-0.5% of assessed value (typical urban India)
            double taxAmount = assessedValue * 0.003;

            String status;
            LocalDate paidDate;
            if (i == 0 && id % 4 == 0) {
                status = "PENDING";
                paidDate = null;
            } else if (i == 0 && id % 4 == 1) {
                status = "OVERDUE";
                paidDate = null;
            } else {
                status = "PAID";
                paidDate = LocalDate.of(year, 3, 15 + (int)(id % 15));
            }

            records.add(TaxRecord.builder()
                    .assessmentYear(year)
                    .assessedValue(Math.round(assessedValue * 100.0) / 100.0)
                    .taxAmount(Math.round(taxAmount * 100.0) / 100.0)
                    .status(status)
                    .receiptNumber(status.equals("PAID")
                            ? String.format("%s/%d/%06d", municipality, year, 100000 + id + i)
                            : null)
                    .paidDate(paidDate)
                    .dueDate(LocalDate.of(year, 3, 31))
                    .municipality(municipality)
                    .build());
        }

        return records;
    }

    private String pickMunicipality(String city) {
        if (city == null) return "Municipal Corporation";
        return switch (city.toLowerCase()) {
            case "bangalore", "bengaluru" -> "BBMP";
            case "mumbai" -> "MCGM";
            case "delhi", "new delhi" -> "MCD";
            case "chennai" -> "GCC";
            case "hyderabad" -> "GHMC";
            case "pune" -> "PMC";
            case "kolkata" -> "KMC";
            case "ahmedabad" -> "AMC";
            default -> city + " Municipal Corp";
        };
    }
}