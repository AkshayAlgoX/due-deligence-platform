// frontend/src/hooks/useRiskAssessment.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import riskAssessmentService from "@/services/riskAssessmentService";

/**
 * useRiskAssessment — data hook for a property's risk data.
 *
 * Fetches breakdown (heavy) + optional history in parallel.
 * Handles loading, error, and recalculation states.
 *
 * @param {number|string|null} propertyId
 * @param {Object} options
 * @param {boolean} [options.loadHistory=false] — also fetch history
 * @param {boolean} [options.autoFetch=true]    — fetch on mount / prop change
 *
 * @returns {{
 *   breakdown: Object|null,
 *   history: Object|null,
 *   loading: boolean,
 *   error: string|null,
 *   recalculating: boolean,
 *   recalculate: () => Promise<void>,
 *   refresh: () => Promise<void>,
 * }}
 */
export function useRiskAssessment(propertyId, options = {}) {
  const { loadHistory = false, autoFetch = true } = options;

  const [breakdown, setBreakdown] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recalculating, setRecalculating] = useState(false);

  // Prevent race conditions on rapid propertyId changes / unmounts
  const activeIdRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchAll = useCallback(async () => {
    if (!propertyId) return;

    const thisFetchId = Symbol("fetch");
    activeIdRef.current = thisFetchId;

    setLoading(true);
    setError(null);

    try {
      const promises = [riskAssessmentService.getBreakdown(propertyId)];
      if (loadHistory) {
        promises.push(riskAssessmentService.getHistory(propertyId));
      }

      const results = await Promise.all(promises);

      // Discard if a newer fetch started or component unmounted
      if (activeIdRef.current !== thisFetchId || !mountedRef.current) return;

      setBreakdown(results[0]);
      if (loadHistory) setHistory(results[1]);
    } catch (err) {
      if (activeIdRef.current !== thisFetchId || !mountedRef.current) return;

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load risk assessment";
      setError(msg);
    } finally {
      if (activeIdRef.current === thisFetchId && mountedRef.current) {
        setLoading(false);
      }
    }
  }, [propertyId, loadHistory]);

  useEffect(() => {
    if (autoFetch && propertyId) {
      fetchAll();
    }
  }, [autoFetch, propertyId, fetchAll]);

  const recalculate = useCallback(async () => {
    if (!propertyId || recalculating) return;

    setRecalculating(true);
    try {
      await riskAssessmentService.recalculate(propertyId);
      await fetchAll();
      toast.success("Risk assessment recalculated with latest data");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to recalculate";
      toast.error(msg);
    } finally {
      if (mountedRef.current) setRecalculating(false);
    }
  }, [propertyId, recalculating, fetchAll]);

  return {
    breakdown,
    history,
    loading,
    error,
    recalculating,
    recalculate,
    refresh: fetchAll,
  };
}