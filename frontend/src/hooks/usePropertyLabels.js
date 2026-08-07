"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getPropertyLabels,
  addPropertyLabel,
  removePropertyLabel,
} from "@/services/propertyLabelService";
import { filterActiveLabels, sortLabelsByPriority } from "@/utils/labelUtils";

/**
 * Hook to load and manage labels for a single property.
 *
 * @param {number|string} propertyId
 * @param {{ autoLoad?: boolean }} options
 * @returns {{ labels, loading, error, refresh, addLabel, removeLabel }}
 */
export function usePropertyLabels(propertyId, options = {}) {
  const { autoLoad = true } = options;
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPropertyLabels(propertyId);
      const active = filterActiveLabels(data);
      setLabels(sortLabelsByPriority(active));
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load labels"
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  const addLabel = useCallback(
    async (type, expiresInDays = null) => {
      const created = await addPropertyLabel(propertyId, type, expiresInDays);
      await load();
      return created;
    },
    [propertyId, load]
  );

  const removeLabel = useCallback(
    async (labelId) => {
      await removePropertyLabel(propertyId, labelId);
      await load();
    },
    [propertyId, load]
  );

  return {
    labels,
    loading,
    error,
    refresh: load,
    addLabel,
    removeLabel,
  };
}