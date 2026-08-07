/**
 * Property Labels service.
 *
 * GET    /api/properties/{propertyId}/labels             → List labels for a property
 * POST   /api/properties/{propertyId}/labels             → Add manual label (admin only)
 * DELETE /api/properties/{propertyId}/labels/{labelId}   → Remove label (admin only)
 * POST   /api/labels/recalculate-all                     → Trigger auto-recalc (admin only)
 * POST   /api/labels/bulk                                → Get labels for multiple properties
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

/**
 * Get all active labels for a property.
 * @param {number} propertyId
 * @returns {Promise<Array>} array of PropertyLabelDto
 */
export async function getPropertyLabels(propertyId) {
  const response = await api.get(API_ROUTES.GET_PROPERTY_LABELS(propertyId));
  return response.data || [];
}

/**
 * Get labels for multiple properties (batch).
 * Used in search results / lists to reduce API calls.
 * @param {number[]} propertyIds
 * @returns {Promise<Object>} { [propertyId]: [labels] }
 */
export async function getBulkPropertyLabels(propertyIds = []) {
  if (!propertyIds || propertyIds.length === 0) return {};
  const response = await api.post(API_ROUTES.BULK_PROPERTY_LABELS, propertyIds);
  return response.data || {};
}

/**
 * Add a manual label to a property (admin only).
 * @param {number} propertyId
 * @param {string} type - LabelType enum value (e.g., "FEATURED", "PREMIUM")
 * @param {number|null} expiresInDays - null = never expires
 * @returns {Promise<Object>} PropertyLabelDto
 */
export async function addPropertyLabel(propertyId, type, expiresInDays = null) {
  const response = await api.post(API_ROUTES.ADD_PROPERTY_LABEL(propertyId), {
    type,
    expiresInDays,
  });
  return response.data;
}

/**
 * Remove a label from a property (admin only).
 * @param {number} propertyId
 * @param {number} labelId
 * @returns {Promise<Object>} { message: string }
 */
export async function removePropertyLabel(propertyId, labelId) {
  const response = await api.delete(
    API_ROUTES.REMOVE_PROPERTY_LABEL(propertyId, labelId)
  );
  return response.data;
}

/**
 * Trigger full auto-label recalculation across ALL properties (admin only).
 * Normally runs hourly via scheduled job — this forces immediate run.
 * @returns {Promise<Object>} { message, propertiesProcessed }
 */
export async function recalculateAllLabels() {
  const response = await api.post(API_ROUTES.RECALCULATE_ALL_LABELS);
  return response.data;
}