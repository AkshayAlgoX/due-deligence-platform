// frontend/src/hooks/usePropertyFilters.js
"use client";

import { useState, useMemo, useCallback } from "react";

/**
 * usePropertyFilters — client-side filter + sort engine.
 *
 * Takes a list of properties and returns the filtered/sorted subset
 * based on the current filter state. No backend calls.
 *
 * riskScores: optional Map<propertyId, RiskScoreResponse> — passed in
 * from the page so highRisk filter can work without this hook
 * fetching data itself (separation of concerns).
 *
 * Usage:
 *   const { filters, filtered, setFilter, clearAll, activeCount } =
 *     usePropertyFilters(allProperties, riskScores);
 */
const DEFAULT_FILTERS = {
  types:       [],       // array of property types (multi-select)
  cities:      [],       // array of city names (multi-select)
  verifiedOnly: false,   // toggle
  pendingOnly:  false,   // toggle
  highRisk:     false,   // toggle — requires riskScores map
  minPrice:    null,     // number or null
  maxPrice:    null,     // number or null
  sortBy:      "recent", // recent | price-asc | price-desc | alpha | risk-desc
};

export function usePropertyFilters(properties = [], riskScores = new Map()) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  }, []);

  const clearAll = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const removeFilter = useCallback((key, value) => {
    setFilters((prev) => {
      if (Array.isArray(prev[key])) {
        return { ...prev, [key]: prev[key].filter((v) => v !== value) };
      }
      if (typeof prev[key] === "boolean") {
        return { ...prev, [key]: false };
      }
      return { ...prev, [key]: null };
    });
  }, []);

  // ── Compute filtered + sorted list ──────────────────────────────
  const filtered = useMemo(() => {
    let result = [...properties];

    if (filters.types.length > 0) {
      result = result.filter((p) => filters.types.includes(p.propertyType));
    }

    if (filters.cities.length > 0) {
      result = result.filter((p) => filters.cities.includes(p.city));
    }

    if (filters.verifiedOnly) {
      result = result.filter((p) => p.verified === true);
    }

    if (filters.pendingOnly) {
      result = result.filter((p) => p.verified !== true);
    }

    if (filters.highRisk) {
      result = result.filter((p) => {
        const rs = riskScores.get(p.id);
        return rs?.riskLabel === "HIGH";
      });
    }

    if (filters.minPrice != null) {
      result = result.filter(
        (p) => (p.marketValue || 0) >= filters.minPrice
      );
    }

    if (filters.maxPrice != null) {
      result = result.filter(
        (p) => (p.marketValue || 0) <= filters.maxPrice
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.marketValue || 0) - (b.marketValue || 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0));
        break;
      case "alpha":
        result.sort((a, b) =>
          (a.address || "").localeCompare(b.address || "")
        );
        break;
      case "risk-desc":
        // Highest risk score first — needs riskScores map
        result.sort((a, b) => {
          const sa = riskScores.get(a.id)?.overallScore ?? 0;
          const sb = riskScores.get(b.id)?.overallScore ?? 0;
          return sb - sa;
        });
        break;
      case "recent":
      default:
        result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [properties, filters, riskScores]);

  // ── Count active (non-default) filters for badge ────────────────
  const activeCount = useMemo(() => {
    let count = 0;
    count += filters.types.length;
    count += filters.cities.length;
    if (filters.verifiedOnly) count += 1;
    if (filters.pendingOnly)  count += 1;
    if (filters.highRisk)     count += 1;
    if (filters.minPrice != null) count += 1;
    if (filters.maxPrice != null) count += 1;
    if (filters.sortBy !== "recent") count += 1;
    return count;
  }, [filters]);

  return {
    filters,
    filtered,
    setFilter,
    toggleArrayFilter,
    removeFilter,
    clearAll,
    activeCount,
  };
}