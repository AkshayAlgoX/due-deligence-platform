/**
 * Saved Comparison service — talks to Spring Boot backend.
 * Handles save / list / get / update / delete for property comparisons.
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

/** Save a new comparison. */
export const saveComparison = async ({ name, notes, propertyIds }) => {
  try {
    const { data } = await api.post(API_ROUTES.COMPARISONS, {
      name,
      notes: notes || null,
      propertyIds,
    });
    return data;
  } catch (err) {
    const msg =
      err.response?.data?.message || err.message || "Failed to save comparison";
    throw new Error(msg);
  }
};

/** Get all MY saved comparisons (newest first). */
export const getMyComparisons = async () => {
  try {
    const { data } = await api.get(API_ROUTES.COMPARISONS);
    return data;
  } catch (err) {
    const msg =
      err.response?.data?.message || err.message || "Failed to load comparisons";
    throw new Error(msg);
  }
};

/** Get a single comparison by ID. */
export const getComparisonById = async (id) => {
  try {
    const { data } = await api.get(API_ROUTES.COMPARISON_BY_ID(id));
    return data;
  } catch (err) {
    const msg =
      err.response?.data?.message || err.message || "Failed to load comparison";
    throw new Error(msg);
  }
};

/** Update name/notes/propertyIds of an existing comparison. */
export const updateComparison = async (id, { name, notes, propertyIds }) => {
  try {
    const { data } = await api.patch(API_ROUTES.COMPARISON_BY_ID(id), {
      name,
      notes: notes || null,
      propertyIds,
    });
    return data;
  } catch (err) {
    const msg =
      err.response?.data?.message || err.message || "Failed to update comparison";
    throw new Error(msg);
  }
};

/** Delete a comparison by ID. */
export const deleteComparison = async (id) => {
  try {
    const { data } = await api.delete(API_ROUTES.COMPARISON_BY_ID(id));
    return data;
  } catch (err) {
    const msg =
      err.response?.data?.message || err.message || "Failed to delete comparison";
    throw new Error(msg);
  }
};