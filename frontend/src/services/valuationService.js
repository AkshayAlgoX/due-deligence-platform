/**
 * Property valuation service — talks to the Spring Boot backend's
 * ComparablePropertyController valuation endpoints.
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

/** Fetch the most recent valuation. Throws (404) if none has been calculated yet. */
export const getLatestValuation = async (propertyId) => {
  const { data } = await api.get(API_ROUTES.VALUATION.GET(propertyId));
  return data;
};

/** Runs a fresh valuation calculation and persists it. */
export const calculateValuation = async (propertyId) => {
  try {
    const { data } = await api.post(API_ROUTES.VALUATION.CALCULATE(propertyId));
    return data;
  } catch (err) {
    const msg = err?.message || "Failed to calculate valuation";
    throw new Error(msg);
  }
};

/** Breakdown across the 3 valuation methods (comparable/cost/income). */
export const getMethodsBreakdown = async (propertyId) => {
  const { data } = await api.get(API_ROUTES.VALUATION.METHODS_BREAKDOWN(propertyId));
  return data;
};

/** All past valuations for this property, most recent first. */
export const getPriceHistory = async (propertyId) => {
  const { data } = await api.get(API_ROUTES.VALUATION.PRICE_HISTORY(propertyId));
  return data;
};
