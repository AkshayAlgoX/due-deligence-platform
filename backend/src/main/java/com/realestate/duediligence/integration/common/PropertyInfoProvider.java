package com.realestate.duediligence.integration.common;

import com.realestate.duediligence.entity.Property;

/**
 * Base contract for every property data provider.
 *
 * Every integration (ownership, tax, zoning, flood, permit, environmental)
 * implements a variant of this interface with the appropriate payload type.
 *
 * Design principle: ADAPTER PATTERN
 *   - Aggregator depends on this interface, not concrete implementations
 *   - Swap mock for real API = one @Primary annotation change
 *   - Each provider is fully isolated
 *
 * @param <T> payload type
 */
public interface PropertyInfoProvider<T> {

    /**
     * Fetch data for the given property.
     * Must never throw — always return an IntegrationResponse
     * (with appropriate status like UNAVAILABLE or ERROR on failure).
     *
     * SLA: must return within 5 seconds.
     */
    IntegrationResponse<T> fetch(Property property);

    /** Provider name for logging & observability. Example: "MockOwnershipProvider" */
    String providerName();
}