/**
 * Property service — talks to Spring Boot backend.
 *
 * Backend endpoints:
 *   GET  /api/properties               → list all
 *   GET  /api/properties/{id}          → single property (with all fields)
 *   GET  /api/properties/search?query= → smart search
 *   POST /api/properties               → add new property
 *
 * Backend now returns full property data (yearBuilt, lotSize, zoning, etc.).
 * Frontend only mocks ownership/tax/transactions (until backend adds them).
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

/** Fetch all properties. */
export const getAllProperties = async () => {
  const response = await api.get(API_ROUTES.PROPERTIES);
  return response.data;
};

/**
 * Fetch a single property by ID.
 * Backend returns full property data — we only add mock ownership/tax/transactions
 * until backend adds those endpoints.
 */
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
 * Real backend search across address, city, state, zipCode, propertyType.
 * Empty query returns all properties.
 */
export const searchProperties = async (query) => {
  if (!query || !query.trim()) {
    return getAllProperties();
  }
  const url = `${API_ROUTES.PROPERTY_SEARCH}?query=${encodeURIComponent(query.trim())}`;
  const response = await api.get(url);
  return response.data;
};

// ── Fallback images (used only if backend doesn't have imageUrl) ──────────
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
];

/**
 * Enrich backend response with mock related data.
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

    // Fallback image if backend doesn't have one
    imageUrl:
      property.imageUrl ||
      FALLBACK_IMAGES[(id - 1) % FALLBACK_IMAGES.length],

    // Mock ownership (until backend endpoint exists)
    ownership: {
      owner: "Simpson Family Trust",
      ownerSince: "June 12, 1998",
      parcelId: `88-01-23-456-${String(id).padStart(3, "0")}`,
      legalDescription: "Lot 24, Block 3, Evergreen Heights Subdivision",
    },

    // Mock tax history (until backend endpoint exists)
    taxHistory: [
      { year: 2023, assessedValue: 1380000, taxAmount: 14250, status: "Paid" },
      { year: 2022, assessedValue: 1320000, taxAmount: 13800, status: "Paid" },
      { year: 2021, assessedValue: 1260000, taxAmount: 13100, status: "Paid" },
      { year: 2020, assessedValue: 1180000, taxAmount: 12450, status: "Paid" },
    ],

    // Mock transactions (until backend endpoint exists)
    transactions: [
      { date: "2020-03-15", type: "Refinance", amount: 850000, party: "Bank of America" },
      { date: "1998-06-12", type: "Sale",      amount: 620000, party: "Simpson Family Trust" },
    ],

    // Building info now comes from backend, with fallbacks
    building: {
      structureType: property.structureType || "Wood Frame",
      condition:     property.condition     || "Excellent",
      stories:       property.stories       || 2,
      bedrooms:      property.bedrooms      || 4,
      bathrooms:     property.bathrooms     || 3,
    },
  };
}