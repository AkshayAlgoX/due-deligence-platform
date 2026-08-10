"use client";

import React from "react";
import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import useAuditLogs from "@/hooks/useAuditLogs";

const AuditLogExport = ({
  onExport,
  exporting = false,
  filters = {},
}) => {
  const { t } = useTranslation();

  const { exportLogs: hookExportLogs } = useAuditLogs();

  const handleExport = async () => {
    try {
      if (exporting) {
        return;
      }

      if (onExport) {
        await onExport(filters);
      } else {
        await hookExportLogs(filters);
      }
    } catch (error) {
      console.error("Failed to export audit logs:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] dark:hover:bg-[#21262d]"
      aria-label={
        exporting
          ? t("audit.exporting")
          : t("audit.export")
      }
    >
      {exporting ? (
        <Loader2
          className="h-4 w-4 animate-spin"
          strokeWidth={2}
        />
      ) : (
        <Download
          className="h-4 w-4"
          strokeWidth={2}
        />
      )}

      <span>
        {exporting
          ? t("audit.exporting")
          : t("audit.export")}
      </span>
    </button>
  );
};

export default AuditLogExport;