// frontend/src/hooks/useCompareSelection.js
"use client";

import { useState, useCallback, useEffect } from "react";

const MAX_COMPARE = 3;
const SESSION_KEY = "dd_compare_properties";
// Legacy key from previous version — read once and migrate away
const LEGACY_IDS_KEY = "dd_compare_ids";

/**
 * useCompareSelection
 *
 * Single source of truth: a Map<id, propertySnapshot>.
 * compareIds is DERIVED from map keys — cannot fall out of sync.
 *
 * Persisted in sessionStorage so navigation between search ↔ comparison
 * preserves selection AND the property preview data.
 *
 * Only a lightweight snapshot is stored (id, address, city, state,
 * imageUrl, marketValue, verified) — not the full property object, so
 * sessionStorage stays small.
 */

// Fields we keep in sessionStorage for CompareBar preview
function toSnapshot(p) {
  if (!p) return null;
  return {
    id: p.id,
    address: p.address ?? "",
    city: p.city ?? "",
    state: p.state ?? "",
    imageUrl: p.imageUrl ?? null,
    propertyType: p.propertyType ?? null,
    marketValue: p.marketValue ?? null,
    verified: !!p.verified,
  };
}

function loadFromStorage() {
  if (typeof window === "undefined") return new Map();

  // Try new format first
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // parsed = [[id, snapshot], ...]
        return new Map(parsed);
      }
    }
  } catch {
    // fallthrough
  }

  // Legacy migration: if old id-only key exists, discard it — we no longer
  // have the snapshot data, so start fresh (safer than showing empty bar).
  try {
    sessionStorage.removeItem(LEGACY_IDS_KEY);
  } catch {}

  return new Map();
}

export function useCompareSelection() {
  // Single source of truth
  const [compareMap, setCompareMap] = useState(loadFromStorage);

  // Persist to sessionStorage on every change
  useEffect(() => {
    try {
      const serializable = Array.from(compareMap.entries());
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(serializable));
    } catch {
      // sessionStorage unavailable — continue without persistence
    }
  }, [compareMap]);

  const toggleCompare = useCallback((property) => {
    if (!property || property.id == null) return;
    const id = property.id;

    setCompareMap((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_COMPARE) return prev; // max reached — no change
        next.set(id, toSnapshot(property));
      }
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareMap(new Map());
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // silently ignore
    }
  }, []);

  // Refresh a snapshot when a property gets updated (e.g. photo added)
  // Only updates if the property is currently selected.
  const refreshSnapshot = useCallback((property) => {
    if (!property || property.id == null) return;
    setCompareMap((prev) => {
      if (!prev.has(property.id)) return prev;
      const next = new Map(prev);
      next.set(property.id, toSnapshot(property));
      return next;
    });
  }, []);

  const isSelected = useCallback((id) => compareMap.has(id), [compareMap]);

  const compareIds  = new Set(compareMap.keys());
  const compareList = Array.from(compareMap.values());
  const count       = compareMap.size;
  const canAddMore  = count < MAX_COMPARE;

  return {
    compareIds,
    compareList,
    toggleCompare,
    clearCompare,
    refreshSnapshot,
    isSelected,
    canAddMore,
    count,
    MAX_COMPARE,
  };
}