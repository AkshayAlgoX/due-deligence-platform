/**
 * Comparable property service — talks to the Spring Boot backend's
 * ComparablePropertyController endpoints.
 *
 * Follows the same pattern as services/propertyService.js:
 * named async exports, api.get/post via the shared axios instance.
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

/**
 * Fetch comparables for a property (basic radius + limit search).
 * Also persists a ComparableAnalysis row server-side.
 */
export const getComparables = async (propertyId, { radius, limit } = {}) => {
  const params = {};
  if (radius != null) params.radius = radius;
  if (limit != null) params.limit = limit;
  const { data } = await api.get(API_ROUTES.COMPARABLE.LIST(propertyId), { params });
  return data;
};

/** Lightweight comparable list for map pins (no analysis row persisted). */
export const getComparablesMapData = async (propertyId, radius) => {
  const params = {};
  if (radius != null) params.radius = radius;
  const { data } = await api.get(API_ROUTES.COMPARABLE.MAP_DATA(propertyId), { params });
  return data;
};

/** Similarity score between the subject property and one specific comparable property. */
export const getSimilarity = async (propertyId, compId) => {
  const { data } = await api.get(API_ROUTES.COMPARABLE.SIMILARITY(propertyId, compId));
  return data;
};

/** Advanced-filter comparable search (price range, bedrooms, property type). */
export const searchComparables = async (propertyId, filters) => {
  try {
    const { data } = await api.post(API_ROUTES.COMPARABLE.SEARCH(propertyId), filters);
    return data;
  } catch (err) {
    const msg = err?.message || "Failed to search comparables";
    throw new Error(msg);
  }
};

/** Monthly price-trend data from nearby comparable properties. */
export const getPriceTrends = async (propertyId) => {
  const { data } = await api.get(API_ROUTES.COMPARABLE.PRICE_TRENDS(propertyId));
  return data;
};
