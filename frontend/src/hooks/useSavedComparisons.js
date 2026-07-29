/**
 * useSavedComparisons — data hook for saved property comparisons.
 *
 * Handles:
 * - Fetching the list on mount
 * - Save / update / delete with optimistic UI
 * - Toast notifications
 * - Loading + error states
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  saveComparison,
  getMyComparisons,
  getComparisonById,
  updateComparison,
  deleteComparison,
} from "@/services/savedComparisonService";

export function useSavedComparisons({ autoFetch = true } = {}) {
  const [comparisons, setComparisons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // stores ID being deleted
  const [error, setError] = useState(null);

  // ─── Fetch List ──────────────────────────────────────────────────────────────

  const fetchComparisons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMyComparisons();
      setComparisons(res?.data ?? []);
    } catch (err) {
      setError(err.message);
      // Don't toast here — caller decides whether to show error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchComparisons();
    }
  }, [autoFetch, fetchComparisons]);

  // ─── Save ────────────────────────────────────────────────────────────────────

  const save = useCallback(async ({ name, notes, propertyIds }) => {
    setIsSaving(true);
    try {
      const res = await saveComparison({ name, notes, propertyIds });
      const newComparison = res?.data;

      // Prepend to list (newest first)
      setComparisons((prev) => [newComparison, ...prev]);
      toast.success("Comparison saved!", {
        description: `"${name}" has been saved to your comparisons.`,
      });
      return newComparison;
    } catch (err) {
      toast.error("Failed to save", {
        description: err.message,
      });
      throw err; // re-throw so modal can handle
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ─── Update ──────────────────────────────────────────────────────────────────

  const update = useCallback(async (id, { name, notes, propertyIds }) => {
    setIsSaving(true);
    try {
      const res = await updateComparison(id, { name, notes, propertyIds });
      const updated = res?.data;

      // Replace in list
      setComparisons((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
      toast.success("Comparison updated!", {
        description: `"${name}" has been updated.`,
      });
      return updated;
    } catch (err) {
      toast.error("Failed to update", {
        description: err.message,
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const remove = useCallback(async (id, name) => {
    setIsDeleting(id);
    try {
      await deleteComparison(id);

      // Remove from list
      setComparisons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Comparison deleted", {
        description: name ? `"${name}" has been removed.` : undefined,
      });
    } catch (err) {
      toast.error("Failed to delete", {
        description: err.message,
      });
      throw err;
    } finally {
      setIsDeleting(null);
    }
  }, []);

  // ─── Get Single (on demand) ──────────────────────────────────────────────────

  const getById = useCallback(async (id) => {
    try {
      const res = await getComparisonById(id);
      return res?.data;
    } catch (err) {
      toast.error("Failed to load comparison", {
        description: err.message,
      });
      throw err;
    }
  }, []);

  // ─── Return ──────────────────────────────────────────────────────────────────

  return {
    comparisons,
    isLoading,
    isSaving,
    isDeleting,   // null or ID — lets UI show spinner on specific row
    error,
    fetchComparisons,
    save,
    update,
    remove,
    getById,
  };
}