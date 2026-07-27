package com.realestate.duediligence.aggregation;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import com.realestate.duediligence.dto.PropertyResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.integration.common.IntegrationResponse;
import com.realestate.duediligence.integration.common.PropertyInfoProvider;
import com.realestate.duediligence.integration.environmental.EnvironmentalInfo;
import com.realestate.duediligence.integration.environmental.EnvironmentalProvider;
import com.realestate.duediligence.integration.flood.FloodZoneInfo;
import com.realestate.duediligence.integration.flood.FloodZoneProvider;
import com.realestate.duediligence.integration.ownership.OwnershipProvider;
import com.realestate.duediligence.integration.ownership.OwnershipRecord;
import com.realestate.duediligence.integration.permit.PermitProvider;
import com.realestate.duediligence.integration.permit.PermitRecord;
import com.realestate.duediligence.integration.tax.TaxHistoryProvider;
import com.realestate.duediligence.integration.tax.TaxRecord;
import com.realestate.duediligence.integration.zoning.ZoningInfo;
import com.realestate.duediligence.integration.zoning.ZoningProvider;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.entity.PropertyDueDiligenceSnapshot;
import com.realestate.duediligence.repository.PropertyDueDiligenceSnapshotRepository;

/**
 * Orchestrates parallel calls to all 6 integration providers.
 *
 * Design:
 * - All providers called in parallel via CompletableFuture
 * - Per-provider timeout: 5 seconds (enforced by provider itself)
 * - Overall aggregation timeout: 8 seconds (safety net)
 * - Providers that fail return graceful IntegrationResponse.unavailable()
 * - Frontend gets the SAME response shape regardless of provider status
 *
 * SLA:
 * Total response < 2s when all providers healthy
 * Total response < 8s worst case (all providers slow)
 */
@Service
public class PropertyAggregationService {

    private static final Logger log = LoggerFactory.getLogger(PropertyAggregationService.class);
    private static final long OVERALL_TIMEOUT_SECONDS = 8;

    private final PropertyRepository propertyRepository;

    // All 6 providers — optional so aggregation still works if any bean is missing.
    // Once Member 2 wires their implementations, these auto-inject.
    private final OwnershipProvider ownershipProvider;
    private final TaxHistoryProvider taxHistoryProvider;
    private final ZoningProvider zoningProvider;
    private final FloodZoneProvider floodZoneProvider;
    private final PermitProvider permitProvider;
    private final EnvironmentalProvider environmentalProvider;
    private final PropertyDueDiligenceSnapshotRepository snapshotRepository;
    private final ObjectMapper objectMapper;

    private final Executor executor;

    @Autowired
    public PropertyAggregationService(
            PropertyRepository propertyRepository,
            PropertyDueDiligenceSnapshotRepository snapshotRepository,
            ObjectMapper objectMapper,
            @Autowired(required = false) OwnershipProvider ownershipProvider,
            @Autowired(required = false) TaxHistoryProvider taxHistoryProvider,
            @Autowired(required = false) ZoningProvider zoningProvider,
            @Autowired(required = false) FloodZoneProvider floodZoneProvider,
            @Autowired(required = false) PermitProvider permitProvider,
            @Autowired(required = false) EnvironmentalProvider environmentalProvider,
            @Qualifier("integrationExecutor") Executor executor) {
        this.propertyRepository = propertyRepository;
        this.snapshotRepository = snapshotRepository;
        this.objectMapper = objectMapper;
        this.ownershipProvider = ownershipProvider;
        this.taxHistoryProvider = taxHistoryProvider;
        this.zoningProvider = zoningProvider;
        this.floodZoneProvider = floodZoneProvider;
        this.permitProvider = permitProvider;
        this.environmentalProvider = environmentalProvider;
        this.executor = executor;
    }

    @Cacheable(value = "propertyAggregation", key = "#propertyId")
    public AggregatedPropertyResponse aggregate(Long propertyId) {
        long start = System.currentTimeMillis();

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found: " + propertyId));

        // Fire all 6 providers in parallel
        CompletableFuture<IntegrationResponse<OwnershipRecord>> ownershipF = callProvider(ownershipProvider, property,
                "ownership");

        CompletableFuture<IntegrationResponse<List<TaxRecord>>> taxF = callProvider(taxHistoryProvider, property,
                "taxHistory");

        CompletableFuture<IntegrationResponse<ZoningInfo>> zoningF = callProvider(zoningProvider, property, "zoning");

        CompletableFuture<IntegrationResponse<FloodZoneInfo>> floodF = callProvider(floodZoneProvider, property,
                "floodZone");

        CompletableFuture<IntegrationResponse<List<PermitRecord>>> permitF = callProvider(permitProvider, property,
                "permits");

        CompletableFuture<IntegrationResponse<EnvironmentalInfo>> envF = callProvider(environmentalProvider, property,
                "environmental");

        // Wait for all, capped at overall timeout
        try {
            CompletableFuture.allOf(ownershipF, taxF, zoningF, floodF, permitF, envF)
                    .get(OVERALL_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            log.warn("Aggregation exceeded {}s for property {}", OVERALL_TIMEOUT_SECONDS, propertyId);
        } catch (Exception e) {
            log.warn("Aggregation error for property {}: {}", propertyId, e.getMessage());
        }

        // Collect results (any still-running futures fall back to UNAVAILABLE)
        IntegrationResponse<OwnershipRecord> ownership = getOrFallback(ownershipF, "ownership");
        IntegrationResponse<List<TaxRecord>> tax = getOrFallback(taxF, "taxHistory");
        IntegrationResponse<ZoningInfo> zoning = getOrFallback(zoningF, "zoning");
        IntegrationResponse<FloodZoneInfo> flood = getOrFallback(floodF, "floodZone");
        IntegrationResponse<List<PermitRecord>> permits = getOrFallback(permitF, "permits");
        IntegrationResponse<EnvironmentalInfo> env = getOrFallback(envF, "environmental");

        long duration = System.currentTimeMillis() - start;

        AggregatedPropertyResponse result = AggregatedPropertyResponse.builder()
                .property(mapProperty(property))
                .ownership(ownership)
                .taxHistory(tax)
                .zoning(zoning)
                .floodZone(flood)
                .permits(permits)
                .environmental(env)
                .overallStatus(computeOverallStatus(
                        ownership, tax, zoning, flood, permits, env))
                .aggregatedAt(Instant.now())
                .totalDurationMs(duration)
                .build();

        persistSnapshot(property, result);

        return result;
    }

    // ── Parallel call with fallback ────────────────────────────────

    private <T> CompletableFuture<IntegrationResponse<T>> callProvider(
            PropertyInfoProvider<T> provider,
            Property property,
            String sectionName) {

        if (provider == null) {
            // Provider bean not wired yet — return UNAVAILABLE immediately
            return CompletableFuture.completedFuture(
                    IntegrationResponse.<T>unavailable(
                            sectionName,
                            "Provider not implemented yet",
                            0L));
        }

        return CompletableFuture.supplyAsync(() -> {
            try {
                return provider.fetch(property);
            } catch (Exception e) {
                log.error("Provider {} threw for property {}: {}",
                        provider.providerName(), property.getId(), e.getMessage());
                return IntegrationResponse.<T>error(
                        provider.providerName(),
                        e.getMessage(),
                        0L);
            }
        }, executor);
    }

    private <T> IntegrationResponse<T> getOrFallback(
            CompletableFuture<IntegrationResponse<T>> future,
            String sectionName) {
        try {
            if (future.isDone()) {
                return future.get();
            }
            // Not done yet after overall timeout — cancel and mark TIMEOUT
            future.cancel(true);
            return IntegrationResponse.<T>timeout(sectionName, OVERALL_TIMEOUT_SECONDS * 1000);
        } catch (Exception e) {
            return IntegrationResponse.<T>error(sectionName, e.getMessage(), 0L);
        }
    }

    // ── Overall status computation ─────────────────────────────────

    private AggregatedPropertyResponse.OverallStatus computeOverallStatus(
            IntegrationResponse<?>... sections) {

        int total = sections.length;
        int failed = 0;

        for (IntegrationResponse<?> section : sections) {
            switch (section.getStatus()) {
                case UNAVAILABLE, TIMEOUT, ERROR -> failed++;
                default -> {
                    /* success or mock counts as OK */ }
            }
        }

        if (failed == 0)
            return AggregatedPropertyResponse.OverallStatus.OK;
        if (failed >= total / 2)
            return AggregatedPropertyResponse.OverallStatus.DEGRADED;
        return AggregatedPropertyResponse.OverallStatus.PARTIAL;
    }

    // ── Property → PropertyResponse mapper ─────────────────────────

    private PropertyResponse mapProperty(Property p) {
        PropertyResponse r = new PropertyResponse();
        r.setId(p.getId());
        r.setAddress(p.getAddress());
        r.setCity(p.getCity());
        r.setState(p.getState());
        r.setZipCode(p.getZipCode());
        r.setPropertyType(p.getPropertyType());
        r.setArea(p.getArea());
        r.setMarketValue(p.getMarketValue());
        r.setYearBuilt(p.getYearBuilt());
        r.setLotSize(p.getLotSize());
        r.setZoning(p.getZoning());
        r.setImageUrl(p.getImageUrl());
        r.setVerified(p.getVerified());
        r.setBedrooms(p.getBedrooms());
        r.setBathrooms(p.getBathrooms());
        r.setStories(p.getStories());
        r.setStructureType(p.getStructureType());
        r.setCondition(p.getCondition());
        return r;
    }
    // ── Persistence ─────────────────────────────────────────────────

    /**
     * Saves a durable snapshot of this aggregation run.
     * Never throws — a persistence failure must not break the API response,
     * since the frontend already has the data it needs.
     */
    private void persistSnapshot(Property property, AggregatedPropertyResponse result) {
        try {
            PropertyDueDiligenceSnapshot snapshot = PropertyDueDiligenceSnapshot.builder()
                    .property(property)
                    .ownershipJson(toJson(result.getOwnership()))
                    .taxHistoryJson(toJson(result.getTaxHistory()))
                    .zoningJson(toJson(result.getZoning()))
                    .floodZoneJson(toJson(result.getFloodZone()))
                    .permitsJson(toJson(result.getPermits()))
                    .environmentalJson(toJson(result.getEnvironmental()))
                    .overallStatus(result.getOverallStatus() != null
                            ? result.getOverallStatus().name()
                            : null)
                    .totalDurationMs(result.getTotalDurationMs())
                    .aggregatedAt(result.getAggregatedAt())
                    .createdAt(Instant.now())
                    .build();

            snapshotRepository.save(snapshot);
        } catch (Exception e) {
            log.warn("Failed to persist due diligence snapshot for property {}: {}",
                    property.getId(), e.getMessage());
        }
    }

    private String toJson(Object value) {
        if (value == null)
            return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            log.warn("Failed to serialize snapshot section: {}", e.getMessage());
            return null;
        }
    }

}