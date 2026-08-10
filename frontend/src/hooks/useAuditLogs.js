"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAuditLogs,
  getAuditLogById,
  getAuditStatistics,
  getAuditLogsByUser,
  getAuditLogsByProperty,
  downloadAuditLogs,
} from "@/services/auditService";

export const useAuditLogs = (initialFilters = {}) => {
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const [filters, setFilters] = useState({
    page: 0,
    size: 20,
    action: "",
    userId: "",
    from: "",
    to: "",
    ...initialFilters,
  });

  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState(null);

  // ─────────────────────────────────────────────
  // Fetch audit logs
  // ─────────────────────────────────────────────

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAuditLogs(filters);

      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      setError(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ─────────────────────────────────────────────
  // Fetch single audit log details
  // ─────────────────────────────────────────────

  const fetchLogDetails = useCallback(async (id) => {
    if (!id) return null;

    setDetailsLoading(true);
    setError(null);

    try {
      const data = await getAuditLogById(id);

      setSelectedLog(data);

      return data;
    } catch (err) {
      console.error("Failed to fetch audit log details:", err);
      setError(err);
      return null;
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────
  // Fetch statistics
  // ─────────────────────────────────────────────

  const fetchStatistics = useCallback(async () => {
    setStatsLoading(true);

    try {
      const data = await getAuditStatistics();

      setStatistics(data);

      return data;
    } catch (err) {
      console.error("Failed to fetch audit statistics:", err);
      setError(err);
      return null;
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────
  // Get logs for a specific user
  // ─────────────────────────────────────────────

  const fetchLogsByUser = useCallback(async (userId) => {
    if (!userId) return [];

    setLoading(true);
    setError(null);

    try {
      const data = await getAuditLogsByUser(userId);

      const result = Array.isArray(data) ? data : [];

      setLogs(result);

      return result;
    } catch (err) {
      console.error("Failed to fetch user audit logs:", err);
      setError(err);
      setLogs([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────
  // Get logs for a specific property
  // ─────────────────────────────────────────────

  const fetchLogsByProperty = useCallback(async (propertyId) => {
    if (!propertyId) return [];

    setLoading(true);
    setError(null);

    try {
      const data = await getAuditLogsByProperty(propertyId);

      const result = Array.isArray(data) ? data : [];

      setLogs(result);

      return result;
    } catch (err) {
      console.error("Failed to fetch property audit logs:", err);
      setError(err);
      setLogs([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────
  // Update one filter
  // ─────────────────────────────────────────────

  const updateFilter = useCallback((name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
      page: name === "page" ? value : 0,
    }));
  }, []);

  // ─────────────────────────────────────────────
  // Update multiple filters
  // ─────────────────────────────────────────────

  const updateFilters = useCallback((newFilters) => {
    setFilters((previous) => ({
      ...previous,
      ...newFilters,
      page:
        Object.prototype.hasOwnProperty.call(newFilters, "page")
          ? newFilters.page
          : 0,
    }));
  }, []);

  // ─────────────────────────────────────────────
  // Clear filters
  // ─────────────────────────────────────────────

  const clearFilters = useCallback(() => {
    setFilters({
      page: 0,
      size: 20,
      action: "",
      userId: "",
      from: "",
      to: "",
    });
  }, []);

  // ─────────────────────────────────────────────
  // Select / clear log
  // ─────────────────────────────────────────────

  const clearSelectedLog = useCallback(() => {
    setSelectedLog(null);
  }, []);

  // ─────────────────────────────────────────────
  // Export audit logs
  // ─────────────────────────────────────────────

  const exportLogs = useCallback(async () => {
    setExporting(true);
    setError(null);

    try {
      await downloadAuditLogs(filters);
    } catch (err) {
      console.error("Failed to export audit logs:", err);
      setError(err);
    } finally {
      setExporting(false);
    }
  }, [filters]);

  // ─────────────────────────────────────────────
 // Automatically fetch when filters change
 // ─────────────────────────────────────────────

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ─────────────────────────────────────────────
 // Fetch dashboard statistics on page load
 // ─────────────────────────────────────────────

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    // Data
    logs,
    statistics,
    selectedLog,

    // Filters
    filters,
    updateFilter,
    updateFilters,
    clearFilters,

    // Loading states
    loading,
    detailsLoading,
    statsLoading,
    exporting,

    // Error
    error,

    // Actions
    fetchLogs,
    fetchLogDetails,
    fetchStatistics,
    fetchLogsByUser,
    fetchLogsByProperty,
    clearSelectedLog,
    exportLogs,
  };
};

export default useAuditLogs;