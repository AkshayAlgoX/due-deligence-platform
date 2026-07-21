/**
 * Aggregation service — talks to the unified property data endpoint.
 *
 * Backend: GET /api/properties/{id}/aggregated
 * Returns AggregatedPropertyResponse with 6 integration sections:
 *   ownership, taxHistory, zoning, floodZone, permits, environmental
 *
 * Each section has shape:
 *   { status, data, dataSource, retrievedAt, reason, durationMs }
 *
 * status values:
 *   LIVE        — real data from third-party API
 *   CACHED      — real data from our cache
 *   MOCK        — seeded mock (real API unavailable for this region)
 *   NO_DATA     — service reachable but no records for this property
 *   UNAVAILABLE — external service failed
 *   TIMEOUT     — external service exceeded SLA
 *   ERROR       — unexpected error
 *
 * Frontend treats LIVE/CACHED/MOCK as "has data",
 * treats NO_DATA/UNAVAILABLE/TIMEOUT/ERROR as "no data" (with reason).
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

/**
 * Fetch full aggregated property view.
 * @param {number|string} id - property ID
 * @returns AggregatedPropertyResponse
 */
export async function getAggregatedProperty(id) {
  const { data } = await api.get(API_ROUTES.PROPERTY_AGGREGATED(id));
  return data;
}

/** Helper: does this section actually have usable data? */
export function sectionHasData(section) {
  if (!section) return false;
  return ["LIVE", "CACHED", "MOCK"].includes(section.status) && section.data != null;
}

/** Helper: is this section's data from a real live API call? */
export function sectionIsLive(section) {
  return section?.status === "LIVE" || section?.status === "CACHED";
}