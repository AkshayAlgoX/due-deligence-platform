"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getLatestValuation,
  calculateValuation,
  getMethodsBreakdown,
  getPriceHistory,
} from "@/services/valuationService";

/**
 * Property valuation hook. Mirrors useRiskAssessment's shape.
 *
 * @param {number|string} propertyId
 * @param {{ autoFetch?: boolean }} options
 */
export function useValuation(propertyId, { autoFetch = true } = {}) {
  const [valuation, setValuation] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [hasValuation, setHasValuation] = useState(true);

  const load = useCallback(async () => {
    if (!propertyId) return;
    try {
      setLoading(true);
      setError(null);

      const [breakdownData, historyData] = await Promise.all([
        getMethodsBreakdown(propertyId),
        getPriceHistory(propertyId).catch(() => []),
      ]);
      setBreakdown(breakdownData);
      setPriceHistory(Array.isArray(historyData) ? historyData : []);

      try {
        const latest = await getLatestValuation(propertyId);
        setValuation(latest);
        setHasValuation(true);
      } catch {
        // No valuation calculated yet — not a real error, just empty state.
        setValuation(null);
        setHasValuation(false);
      }
    } catch (err) {
      setError(err?.message ?? "Failed to load valuation data");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const calculate = useCallback(async () => {
    if (!propertyId) return;
    try {
      setCalculating(true);
      setError(null);
      const result = await calculateValuation(propertyId);
      setValuation(result);
      setHasValuation(true);
      // Refresh breakdown + history since a new calculation just happened.
      const [breakdownData, historyData] = await Promise.all([
        getMethodsBreakdown(propertyId),
        getPriceHistory(propertyId).catch(() => []),
      ]);
      setBreakdown(breakdownData);
      setPriceHistory(Array.isArray(historyData) ? historyData : []);
      return result;
    } catch (err) {
      setError(err?.message ?? "Failed to calculate valuation");
      throw err;
    } finally {
      setCalculating(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (autoFetch) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  return {
    valuation,
    breakdown,
    priceHistory,
    hasValuation,
    loading,
    calculating,
    error,
    calculate,
    refresh: load,
  };
}
