package com.realestate.duediligence.integration.common;

/**
 * Data source status for every integration response.
 *
 * Honest labeling — tells frontend & mentor exactly where data came from.
 * Every response from every provider carries one of these.
 */
public enum IntegrationStatus {

    /** Fetched from real live third-party API just now. */
    LIVE,

    /** Real data but served from cache (still valid). */
    CACHED,

    /** Mock/seeded data — real API not available for this region. */
    MOCK,

    /** Service reachable but no data exists for this property. */
    NO_DATA,

    /** External service failed (network, 500, parse error). */
    UNAVAILABLE,

    /** External service exceeded SLA (5s per provider). */
    TIMEOUT,

    /** Internal error — usually a bug. Should not happen in production. */
    ERROR
}