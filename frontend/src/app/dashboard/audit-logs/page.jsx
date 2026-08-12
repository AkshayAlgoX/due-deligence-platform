"use client";

import React, { useState } from "react";
import { ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";

import AuditLogTable from "@/components/audit/AuditLogTable";
import AuditLogFilters from "@/components/audit/AuditLogFilters";
import AuditLogDetailModal from "@/components/audit/AuditLogDetailModal";
import AuditLogExport from "@/components/audit/AuditLogExport";
import AuditTimeline from "@/components/audit/AuditTimeline";
import UserActivityGraph from "@/components/audit/UserActivityGraph";

import useAuditLogs from "@/hooks/useAuditLogs";

export default function AuditLogsPage() {
  const { t } = useTranslation();

  const [selectedLog, setSelectedLog] = useState(null);

  const {
    logs,
    loading,
    detailsLoading,
    statsLoading,
    exporting,
    error,
    statistics,
    filters,
    updateFilters,
    clearFilters,
    fetchLogDetails,
    exportLogs,
    clearSelectedLog,
  } = useAuditLogs();

  // =========================================================
  // VIEW DETAILS
  // =========================================================
  const handleViewDetails = async (log) => {
    if (!log?.id) return;

    try {
      const data = await fetchLogDetails(log.id);

      if (data) {
        setSelectedLog(data);
      }
    } catch (err) {
      console.error("Failed to load audit log details:", err);
    }
  };

  // =========================================================
  // CLOSE DETAILS MODAL
  // =========================================================
  const handleCloseDetails = () => {
    setSelectedLog(null);

    if (clearSelectedLog) {
      clearSelectedLog();
    }
  };

  // =========================================================
  // KEEP NUMBERS AS ENGLISH DIGITS
  // =========================================================
  const numberValue = (value) => {
    return String(value ?? 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* =========================================================
            PAGE HEADER
        ========================================================= */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-200 bg-green-50 dark:border-green-500/30 dark:bg-green-500/10">
                <ClipboardList className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
                {t("audit.title")}
              </h1>
            </div>

            <p className="ml-14 mt-2 text-sm text-gray-500 dark:text-[#7d8590]">
              {t("audit.description")}
            </p>
          </div>

          {/* Export only - Refresh removed */}
          <div className="flex items-center">
            <AuditLogExport
              onExport={exportLogs}
              exporting={exporting}
              filters={filters}
            />
          </div>
        </div>

        {/* =========================================================
            STATISTICS
        ========================================================= */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          {/* Total Logs */}
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                {t("audit.stats.totalLogs")}
              </span>
            </div>

            <div className="text-2xl font-black tabular-nums text-gray-700 dark:text-[#e6edf3]">
              {statsLoading
                ? "..."
                : numberValue(statistics?.totalLogs)}
            </div>
          </div>

          {/* Login Events */}
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                {t("audit.stats.loginEvents")}
              </span>
            </div>

            <div className="text-2xl font-black tabular-nums text-green-500">
              {statsLoading
                ? "..."
                : numberValue(statistics?.loginEvents)}
            </div>
          </div>

          {/* Reports Generated */}
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                {t("audit.stats.reportsGenerated")}
              </span>
            </div>

            <div className="text-2xl font-black tabular-nums text-blue-500">
              {statsLoading
                ? "..."
                : numberValue(statistics?.reportGenerated)}
            </div>
          </div>

          {/* Properties Created */}
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                {t("audit.stats.propertiesCreated")}
              </span>
            </div>

            <div className="text-2xl font-black tabular-nums text-purple-500">
              {statsLoading
                ? "..."
                : numberValue(statistics?.propertyCreated)}
            </div>
          </div>
        </div>

        {/* =========================================================
            ACTIVITY GRAPH
        ========================================================= */}
        <div className="mb-6">
          <UserActivityGraph
            logs={logs}
            loading={loading}
          />
        </div>

        {/* =========================================================
            FILTERS
        ========================================================= */}
        <div className="mb-6">
          <AuditLogFilters
            filters={filters}
            onChange={updateFilters}
            onClear={clearFilters}
            loading={loading}
          />
        </div>

        {/* =========================================================
            ERROR
        ========================================================= */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400">
            {error?.message || t("audit.errors.loadFailed")}
          </div>
        )}

        {/* =========================================================
            TABLE
        ========================================================= */}
        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-[#30363d] dark:bg-[#161b22]">
          <AuditLogTable
            logs={logs}
            loading={loading}
            error={error}
            onViewDetails={handleViewDetails}
          />
        </div>

        {/* =========================================================
            TIMELINE
        ========================================================= */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-[#30363d] dark:bg-[#161b22]">
          <AuditTimeline logs={logs} />
        </div>

        {/* =========================================================
            DETAILS MODAL
        ========================================================= */}
        <AuditLogDetailModal
          open={!!selectedLog}
          log={selectedLog}
          loading={detailsLoading}
          onClose={handleCloseDetails}
        />
      </div>
    </div>
  );
}