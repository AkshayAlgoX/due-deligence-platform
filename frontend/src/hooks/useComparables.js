"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getComparables,
  searchComparables,
  getPriceTrends,
} from "@/services/comparableService";

/**
 * Comparable-properties hook. Mirrors the shape of useRiskAssessment
 * (loading/error/recalculate-style API) for consistency with the rest
 * of the codebase.
 *
 * @param {number|string} propertyId
 * @param {{ autoFetch?: boolean, defaultRadius?: number }} options
 */
export function useComparables(propertyId, { autoFetch = true, defaultRadius = 5 } = {}) {
  const [analysis, setAnalysis] = useState(null);
  const [priceTrends, setPriceTrends] = useState([]);
  const [radius, setRadius] = useState(defaultRadius);
  const [loading, setLoading] = useState(autoFetch);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);

  const fetchComparables = useCallback(
    async (r = radius) => {
      if (!propertyId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getComparables(propertyId, { radius: r });
        setAnalysis(data);
      } catch (err) {
        setError(err?.message ?? "Failed to load comparable properties");
      } finally {
        setLoading(false);
      }
    },
    [propertyId, radius]
  );

  const fetchPriceTrends = useCallback(async () => {
    if (!propertyId) return;
    try {
      setTrendsLoading(true);
      const data = await getPriceTrends(propertyId);
      setPriceTrends(Array.isArray(data) ? data : []);
    } catch {
      setPriceTrends([]);
    } finally {
      setTrendsLoading(false);
    }
  }, [propertyId]);

  const search = useCallback(
    async (filters) => {
      if (!propertyId) return;
      try {
        setSearching(true);
        setError(null);
        const data = await searchComparables(propertyId, { radiusKm: radius, ...filters });
        setAnalysis(data);
      } catch (err) {
        setError(err?.message ?? "Search failed");
      } finally {
        setSearching(false);
      }
    },
    [propertyId, radius]
  );

  const changeRadius = useCallback(
    (r) => {
      setRadius(r);
      fetchComparables(r);
    },
    [fetchComparables]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchComparables(defaultRadius);
      fetchPriceTrends();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  return {
    analysis,
    comparables: analysis?.comparables ?? [],
    priceTrends,
    radius,
    setRadius: changeRadius,
    loading,
    trendsLoading,
    searching,
    error,
    refresh: () => fetchComparables(radius),
    search,
  };
}
