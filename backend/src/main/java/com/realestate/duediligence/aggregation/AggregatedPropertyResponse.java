package com.realestate.duediligence.aggregation;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.realestate.duediligence.dto.PropertyResponse;
import com.realestate.duediligence.integration.common.IntegrationResponse;
import com.realestate.duediligence.integration.environmental.EnvironmentalInfo;
import com.realestate.duediligence.integration.flood.FloodZoneInfo;
import com.realestate.duediligence.integration.ownership.OwnershipRecord;
import com.realestate.duediligence.integration.permit.PermitRecord;
import com.realestate.duediligence.integration.tax.TaxRecord;
import com.realestate.duediligence.integration.zoning.ZoningInfo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Complete aggregated property view.
 *
 * Contract with frontend:
 *   - `property` is always present (from DB)
 *   - Each integration section is ALWAYS an IntegrationResponse
 *     (status tells frontend how to render)
 *   - `overallStatus` is a summary: OK / PARTIAL / DEGRADED
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AggregatedPropertyResponse {

    /** Base property from our own DB. */
    private PropertyResponse property;

    /** Ownership + land registry data. */
    private IntegrationResponse<OwnershipRecord> ownership;

    /** Property tax history (list of records). */
    private IntegrationResponse<List<TaxRecord>> taxHistory;

    /** Zoning classification & rules. */
    private IntegrationResponse<ZoningInfo> zoning;

    /** Flood risk assessment. */
    private IntegrationResponse<FloodZoneInfo> floodZone;

    /** Building & renovation permits. */
    private IntegrationResponse<List<PermitRecord>> permits;

    /** Environmental data (AQI, soil, etc.). */
    private IntegrationResponse<EnvironmentalInfo> environmental;

    /**
     * Summary of how the whole aggregation went.
     * OK = all sections returned data
     * PARTIAL = some sections unavailable/timed out
     * DEGRADED = majority failed
     */
    private OverallStatus overallStatus;

    /** When the full aggregation was completed. */
    private Instant aggregatedAt;

    /** Total end-to-end aggregation time. */
    private Long totalDurationMs;

    public enum OverallStatus {
        OK, PARTIAL, DEGRADED
    }
}