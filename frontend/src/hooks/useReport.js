// frontend/src/hooks/useReport.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import reportService from "@/services/reportService";
import { isTerminalStatus } from "@/utils/reportUtils";

const POLL_INTERVAL_MS = 2000; // 2 seconds between polls
const MAX_POLL_ATTEMPTS = 150; // 5 minutes max before giving up

/**
 * useReport — manages the full report lifecycle.
 *
 * Modes:
 *  1. GENERATE mode: call generate(payload) → poll until terminal
 *  2. FETCH mode:    pass reportId prop → fetch full report once
 *  3. LIST mode:     call fetchList(params) → paginated list
 *
 * Polling logic:
 *  - Starts automatically after generate() or regenerate()
 *  - Polls every 2 seconds
 *  - Stops on COMPLETED | FAILED or after 150 attempts
 *  - Cleans up interval on unmount
 */
export function useReport(reportId = null) {
  // ── Report data ──
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── List data ──
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);

  // ── Polling state ──
  const [polling, setPolling] = useState(false);
  const [pollingReportId, setPollingReportId] = useState(null);
  const pollTimer = useRef(null);
  const pollAttempts = useRef(0);

  // ── Action states ──
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ─────────────────────────────────────────────────────────
  // POLLING ENGINE
  // ─────────────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    setPolling(false);
    pollAttempts.current = 0;
  }, []);

  const startPolling = useCallback(
    (id) => {
      stopPolling();
      setPollingReportId(id);
      setPolling(true);
      pollAttempts.current = 0;

      pollTimer.current = setInterval(async () => {
        pollAttempts.current += 1;

        // Safety cutoff
        if (pollAttempts.current > MAX_POLL_ATTEMPTS) {
          stopPolling();
          setError("Report generation timed out. Please try again.");
          return;
        }

        try {
          const statusData = await reportService.getStatus(id);
          setStatus(statusData.status);

          // Update report shell with latest status
          setReport((prev) =>
            prev ? { ...prev, status: statusData.status } : statusData
          );

          if (isTerminalStatus(statusData.status)) {
            stopPolling();

            // If completed, fetch the full report with all sections
            if (statusData.status === "COMPLETED") {
              try {
                const full = await reportService.getById(id);
                setReport(full);
              } catch (fetchErr) {
                console.error("Failed to fetch completed report:", fetchErr);
                setError("Report completed but failed to load. Refresh the page.");
              }
            } else if (statusData.status === "FAILED") {
              setError(
                statusData.errorMessage ||
                  "Report generation failed. Please try again."
              );
            }
          }
        } catch (pollErr) {
          console.error("Poll error:", pollErr);
          // Don't stop polling on transient network errors — keep trying
          // Stop only if we get a 404 (report deleted) or 401 (auth expired)
          if (
            pollErr?.response?.status === 404 ||
            pollErr?.response?.status === 401
          ) {
            stopPolling();
            setError("Report not found or session expired.");
          }
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // ─────────────────────────────────────────────────────────
  // FETCH SINGLE REPORT (when reportId prop is provided)
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reportService.getById(reportId);
        if (!cancelled) {
          setReport(data);
          setStatus(data.status);
          // If report is still in progress, start polling
          if (!isTerminalStatus(data.status)) {
            startPolling(reportId);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load report."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [reportId, startPolling]);

  // ─────────────────────────────────────────────────────────
  // GENERATE
  // ─────────────────────────────────────────────────────────

  const generate = useCallback(
    async (payload) => {
      setGenerating(true);
      setError(null);
      setReport(null);
      setStatus(null);
      try {
        // POST → 202 with PENDING shell
        const pending = await reportService.generate(payload);
        setReport(pending);
        setStatus(pending.status);
        // Start polling immediately
        startPolling(pending.id);
        return pending;
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          "Failed to start report generation.";
        setError(msg);
        throw err;
      } finally {
        setGenerating(false);
      }
    },
    [startPolling]
  );

  // ─────────────────────────────────────────────────────────
  // REGENERATE
  // ─────────────────────────────────────────────────────────

  const regenerate = useCallback(
    async (id) => {
      setRegenerating(true);
      setError(null);
      try {
        const pending = await reportService.regenerate(id);
        setReport(pending);
        setStatus(pending.status);
        startPolling(pending.id);
        return pending;
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          "Failed to regenerate report.";
        setError(msg);
        throw err;
      } finally {
        setRegenerating(false);
      }
    },
    [startPolling]
  );

  // ─────────────────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────────────────

  const deleteReport = useCallback(async (id) => {
    setDeleting(true);
    try {
      await reportService.delete(id);
      setReport(null);
      setStatus(null);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to delete report.";
      setError(msg);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────
  // LIST
  // ─────────────────────────────────────────────────────────

  const fetchList = useCallback(async (params = {}) => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await reportService.list(params);
      // Spring Page object: { content, totalPages, totalElements, number, size }
      setReports(data.content || []);
      setPagination({
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        page: data.number,
        size: data.size,
      });
      return data;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to load reports.";
      setListError(msg);
      throw err;
    } finally {
      setListLoading(false);
    }
  }, []);

  const fetchListByProperty = useCallback(async (propertyId) => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await reportService.listByProperty(propertyId);
      setReports(data || []);
      return data;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to load reports.";
      setListError(msg);
      throw err;
    } finally {
      setListLoading(false);
    }
  }, []);

  return {
    // Single report
    report,
    status,
    loading,
    error,

    // List
    reports,
    pagination,
    listLoading,
    listError,

    // Polling state
    polling,
    pollingReportId,

    // Action states
    generating,
    regenerating,
    deleting,

    // Actions
    generate,
    regenerate,
    deleteReport,
    fetchList,
    fetchListByProperty,
  };
}