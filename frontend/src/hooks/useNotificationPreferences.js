"use client";

/**
 * useNotificationPreferences — loads and saves notification preferences.
 */
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import notificationService from "@/services/notificationService";
import { getToken } from "@/utils/helpers";

export function useNotificationPreferences() {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchPreferences = useCallback(async () => {
    if (!getToken()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getPreferences();
      setPreferences(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const savePreferences = useCallback(
    async (updatedPrefs) => {
      setSaving(true);
      try {
        const saved = await notificationService.updatePreferences(updatedPrefs);
        setPreferences(saved);
        toast.success(t("notification.preferences.saved"));
      } catch (err) {
        toast.error(t("notification.preferences.saveFailed"));
      } finally {
        setSaving(false);
      }
    },
    [t]
  );

  const togglePreference = useCallback(
    (key) => {
      setPreferences((prev) => {
        if (!prev) return prev;
        return { ...prev, [key]: !prev[key] };
      });
    },
    []
  );

  return {
    preferences,
    loading,
    saving,
    error,
    savePreferences,
    togglePreference,
    refresh: fetchPreferences,
  };
}
