/**
 * Property service — talks to Spring Boot backend.
 *
 * NOTE: Related property data (ownership, tax, permits, zoning, flood,
 * environmental) now comes from the aggregation endpoint, NOT this service.
 * See services/aggregationService.js for that.
 *
 * This service is now ONLY for basic CRUD on the property itself.
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

/** Fetch all properties. */
export const getAllProperties = async () => {
  const response = await api.get(API_ROUTES.PROPERTIES);
  return response.data;
};

/** Fetch a single property by ID. */
export const getPropertyById = async (id) => {
  const response = await api.get(API_ROUTES.PROPERTY_BY_ID(id));
  return response.data;
};

/** Add a new property (POST). */
export const addProperty = async (data) => {
  const response = await api.post(API_ROUTES.PROPERTIES, data);
  return response.data;
};

/**
 * Update an existing property. Backend re-runs verification automatically.
 */
export async function updateProperty(id, data) {
  try {
    const { data: response } = await api.put(`/api/properties/${id}`, data);
    return response;
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Failed to update property";
    throw new Error(msg);
  }
}

/**
 * Delete a property permanently (owner or ADMIN only).
 * Reports already generated for this property remain in history.
 */
export async function deleteProperty(id) {
  try {
    await api.delete(`/api/properties/${id}`);
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Failed to delete property";
    throw new Error(msg);
  }
}

/** Admin-only: re-verify all existing properties in the database. */
export async function reverifyAllProperties() {
  try {
    const { data } = await api.post("/api/properties/admin/reverify-all");
    return data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Failed to re-verify";
    throw new Error(msg);
  }
}

/** Backend search across address, city, state, zipCode, propertyType. */
export const searchProperties = async (query) => {
  if (!query || !query.trim()) return getAllProperties();
  const url = `${API_ROUTES.PROPERTY_SEARCH}?query=${encodeURIComponent(query.trim())}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Fetch geo-tagged properties for portfolio map.
 * Only returns properties with latitude + longitude set.
 */
export const getGeoProperties = async () => {
  const { data } = await api.get(API_ROUTES.PROPERTIES_GEO);
  return (data ?? []).map((p) => ({
    id: p.id,
    address: p.address ?? "",
    city: p.city ?? "",
    state: p.state ?? "",
    latitude: p.latitude,
    longitude: p.longitude,
    marketValue: p.marketValue ?? 0,
    verified: p.verified ?? false,
    propertyType: p.propertyType ?? "",
  }));
};
/**
 * Fetch risk score for a single property.
 * Returns RiskScoreResponse from the backend risk engine.
 * Uses cached aggregation data server-side — fast on repeat calls.
 */
export const getPropertyRisk = async (id) => {
  const { data } = await api.get(API_ROUTES.PROPERTY_RISK(id));
  return data;
};