/**
 * Property service — talks to Spring Boot backend.
 *
 * Backend returns imageUrl only if user provided one when adding property.
 * DB is clean (no fake seed URLs) — frontend trusts backend response.
 *
 * When imageUrl is null/empty, PropertyImagePlaceholder shows an
 * elegant "Photo Pending" state (never fake stock photos).
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

/** Fetch all properties. */
export const getAllProperties = async () => {
  const response = await api.get(API_ROUTES.PROPERTIES);
  return response.data;
};

/** Fetch a single property by ID (with mock ownership/tax/transactions). */
export const getPropertyById = async (id) => {
  const response = await api.get(API_ROUTES.PROPERTY_BY_ID(id));
  return enrichWithMockRelated(response.data);
};

/** Add a new property (POST). */
export const addProperty = async (data) => {
  const response = await api.post(API_ROUTES.PROPERTIES, data);
  return response.data;
};

/**
 * Update an existing property. Backend re-runs verification automatically.
 * @param {number} id - property ID
 * @param {object} data - PropertyRequest fields
 */
export async function updateProperty(id, data) {
  try {
    const { data: response } = await api.put(`/api/properties/${id}`, data);
    return response;
  } catch (err) {
    const msg = err.response?.data?.message || "Failed to update property";
    throw new Error(msg);
  }
}

/**
 * Admin-only: re-verify all existing properties in the database.
 */
export async function reverifyAllProperties() {
  try {
    const { data } = await api.post("/api/properties/admin/reverify-all");
    return data;
  } catch (err) {
    const msg = err.response?.data?.message || "Failed to re-verify";
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
 * Enrich single-property response with mock ownership/tax/transactions.
 * TODO: Remove when backend adds:
 *   GET /api/properties/{id}/ownership
 *   GET /api/properties/{id}/tax-history
 *   GET /api/properties/{id}/transactions
 */
function enrichWithMockRelated(property) {
  if (!property) return null;
  const id = property.id ?? 1;

  return {
    ...property,

    ownership: {
      owner: "Simpson Family Trust",
      ownerSince: "June 12, 1998",
      parcelId: `88-01-23-456-${String(id).padStart(3, "0")}`,
      legalDescription: "Lot 24, Block 3, Evergreen Heights Subdivision",
    },

    taxHistory: [
      { year: 2023, assessedValue: 1380000, taxAmount: 14250, status: "Paid" },
      { year: 2022, assessedValue: 1320000, taxAmount: 13800, status: "Paid" },
      { year: 2021, assessedValue: 1260000, taxAmount: 13100, status: "Paid" },
      { year: 2020, assessedValue: 1180000, taxAmount: 12450, status: "Paid" },
    ],

    transactions: [
      { date: "2020-03-15", type: "Refinance", amount: 850000, party: "Bank of America" },
      { date: "1998-06-12", type: "Sale",      amount: 620000, party: "Simpson Family Trust" },
    ],

    building: {
      structureType: property.structureType || "Wood Frame",
      condition:     property.condition     || "Excellent",
      stories:       property.stories       || 2,
      bedrooms:      property.bedrooms      || 4,
      bathrooms:     property.bathrooms     || 3,
    },
  };
}
