package com.realestate.duediligence.integration.common;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Uniform wrapper for every integration response.
 *
 * Design principle: FRONTEND ALWAYS GETS THE SAME SHAPE.
 * Whether ownership succeeded, tax mocked, or zoning timed out —
 * every section looks structurally identical, just with different status.
 *
 * @param <T> the payload type (OwnershipRecord, TaxRecord, etc.)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IntegrationResponse<T> {

    /** Where the data came from (LIVE/MOCK/UNAVAILABLE/etc.) */
    private IntegrationStatus status;

    /** The actual payload. Null when status != LIVE/CACHED/MOCK. */
    private T data;

    /**
     * Human-readable source description.
     * Example: "CPCB AQI API", "Bhoomi land registry (mock)", "Timed out after 5s"
     */
    private String dataSource;

    /** UTC timestamp when this response was created. */
    private Instant retrievedAt;

    /**
     * Reason for non-success statuses. Null on success.
     * Example: "Public land registry API not available for India"
     */
    private String reason;

    /** Response time in ms — useful for observability. */
    private Long durationMs;

    // ── Convenience factory methods ────────────────────────────────

    public static <T> IntegrationResponse<T> live(T data, String source, long durationMs) {
        return IntegrationResponse.<T>builder()
                .status(IntegrationStatus.LIVE)
                .data(data)
                .dataSource(source)
                .retrievedAt(Instant.now())
                .durationMs(durationMs)
                .build();
    }

    public static <T> IntegrationResponse<T> mock(T data, String source, String reason, long durationMs) {
        return IntegrationResponse.<T>builder()
                .status(IntegrationStatus.MOCK)
                .data(data)
                .dataSource(source)
                .reason(reason)
                .retrievedAt(Instant.now())
                .durationMs(durationMs)
                .build();
    }

    public static <T> IntegrationResponse<T> noData(String source, long durationMs) {
        return IntegrationResponse.<T>builder()
                .status(IntegrationStatus.NO_DATA)
                .dataSource(source)
                .reason("No records found for this property")
                .retrievedAt(Instant.now())
                .durationMs(durationMs)
                .build();
    }

    public static <T> IntegrationResponse<T> unavailable(String source, String reason, long durationMs) {
        return IntegrationResponse.<T>builder()
                .status(IntegrationStatus.UNAVAILABLE)
                .dataSource(source)
                .reason(reason)
                .retrievedAt(Instant.now())
                .durationMs(durationMs)
                .build();
    }

    public static <T> IntegrationResponse<T> timeout(String source, long durationMs) {
        return IntegrationResponse.<T>builder()
                .status(IntegrationStatus.TIMEOUT)
                .dataSource(source)
                .reason("Service exceeded 5-second SLA")
                .retrievedAt(Instant.now())
                .durationMs(durationMs)
                .build();
    }

    public static <T> IntegrationResponse<T> error(String source, String reason, long durationMs) {
        return IntegrationResponse.<T>builder()
                .status(IntegrationStatus.ERROR)
                .dataSource(source)
                .reason(reason)
                .retrievedAt(Instant.now())
                .durationMs(durationMs)
                .build();
    }
}