// frontend/src/services/riskAssessmentService.js
"use client";

import api from "@/services/api";
import { API_ROUTES } from "@/constants/apiRoutes";

/**
 * Risk Assessment API client.
 *
 * All methods return the raw response.data — components use React Query-style
 * hooks (see useRiskAssessment) rather than calling these directly.
 *
 * Errors bubble up as-is — components/hooks handle them.
 */
const riskAssessmentService = {
  /**
   * Fetch or compute risk assessment summary for a property.
   * Fast: returns cached DB value on subsequent calls.
   *
   * @param {number|string} propertyId
   * @returns {Promise<Object>} RiskAssessmentResponse
   */
  async getAssessment(propertyId) {
    const res = await api.get(API_ROUTES.RISK.GET(propertyId));
    return res.data;
  },

  /**
   * Fetch full breakdown with per-factor explanations & recommendations.
   * Heavier: loads all 6 factors from DB (or computes if missing).
   *
   * @param {number|string} propertyId
   * @returns {Promise<Object>} RiskBreakdownDto
   */
  async getBreakdown(propertyId) {
    const res = await api.get(API_ROUTES.RISK.BREAKDOWN(propertyId));
    return res.data;
  },

  /**
   * Fetch complete assessment history (all versions, oldest → newest).
   * Used by trend charts.
   *
   * @param {number|string} propertyId
   * @returns {Promise<Object>} RiskHistoryDto
   */
  async getHistory(propertyId) {
    const res = await api.get(API_ROUTES.RISK.HISTORY(propertyId));
    return res.data;
  },

  /**
   * Force fresh risk recalculation. Previous latest becomes historical.
   * Slow: triggers full PropertyAggregationService call.
   *
   * @param {number|string} propertyId
   * @returns {Promise<Object>} RiskAssessmentResponse
   */
  async recalculate(propertyId) {
    const res = await api.post(API_ROUTES.RISK.RECALCULATE(propertyId));
    return res.data;
  },
};

export default riskAssessmentService;