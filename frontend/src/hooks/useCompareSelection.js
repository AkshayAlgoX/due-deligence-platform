// frontend/src/hooks/useCompareSelection.js
"use client";

import { useState, useCallback, useEffect } from "react";

const MAX_COMPARE = 3;
const SESSION_KEY = "dd_compare_ids";

/**
 * useCompareSelection
 *
 * Manages which property IDs are selected for comparison.
 * Max 3 properties. Persisted in sessionStorage so selection
 * survives navigation between search → compare → back.
 *
 * Returns:
 *   compareIds       - Set<number>
 *   toggleCompare    - (property) => void
 *   clearCompare     - () => void
 *   isSelected       - (id) => boolean
 *   canAddMore       - boolean (false when 3 selected)
 *   compareList      - Array of property objects (for CompareBar preview)
 */
export function useCompareSelection() {
  const [compareIds, setCompareIds] = useState(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Map<id, property> — keeps property objects for the bar preview
  const [compareProperties, setCompareProperties] = useState(new Map());

  // Persist to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify([...compareIds]));
    } catch {
      // sessionStorage unavailable — continue without persistence
    }
  }, [compareIds]);

  const toggleCompare = useCallback((property) => {
    const id = property.id;
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setCompareProperties((m) => {
          const nm = new Map(m);
          nm.delete(id);
          return nm;
        });
      } else {
        if (next.size >= MAX_COMPARE) return prev; // max reached — ignore
        next.add(id);
        setCompareProperties((m) => new Map(m).set(id, property));
      }
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds(new Set());
    setCompareProperties(new Map());
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  }, []);

  const isSelected  = useCallback((id) => compareIds.has(id), [compareIds]);
  const canAddMore  = compareIds.size < MAX_COMPARE;
  const compareList = [...compareProperties.values()];

  return {
    compareIds,
    compareList,
    toggleCompare,
    clearCompare,
    isSelected,
    canAddMore,
    count: compareIds.size,
  };
}