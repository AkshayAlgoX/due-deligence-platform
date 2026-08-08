"use client";

import { useTranslation } from "react-i18next";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Clock,
  History,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatBytes } from "@/utils/downloadUtils";

export default function ExportHistoryList({
  history = [],
  isLoading = false,
  page = 0,
  totalPages = 1,
  onPageChange,
  onDownloadItem,
}) {
  const { t } = useTranslation();

  const getFormatBadge = (format) => {
    if (format === "EXCEL") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1
          rounded-lg text-xs font-semibold
          bg-emerald-50 dark:bg-emerald-950/60
          text-emerald-600 dark:text-emerald-400
          border border-emerald-200/60 dark:border-emerald-900/60">
          <FileSpreadsheet className="w-3.5 h-3.5" strokeWidth={2} />
          EXCEL
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1
        rounded-lg text-xs font-semibold
        bg-red-50 dark:bg-red-950/60
        text-red-600 dark:text-red-400
        border border-red-200/60 dark:border-red-900/60">
        <FileText className="w-3.5 h-3.5" strokeWidth={2} />
        PDF
      </span>
    );
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16
        text-gray-400 dark:text-[#7d8590]">
        <Loader2 className="w-8 h-8 animate-spin text-[#22C55E] mb-3"
          strokeWidth={2} />
        <p className="text-sm font-medium">
          {t("export.loadingHistory", "Loading export history...")}
        </p>
      </div>
    );
  }

  // ── Empty state ──
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center
        py-16 px-4 text-center
        rounded-2xl border border-dashed
        border-gray-200 dark:border-[#30363d]
        bg-gray-50/50 dark:bg-[#0d1117]">
        <div className="p-3.5 rounded-2xl
          bg-gray-100 dark:bg-[#161b22]
          text-gray-400 dark:text-[#7d8590] mb-4">
          <History className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <h4 className="font-bold text-gray-900 dark:text-[#e6edf3] mb-1.5">
          {t("export.noHistory", "No Export History Yet")}
        </h4>
        <p className="text-xs text-gray-500 dark:text-[#7d8590] max-w-sm leading-relaxed">
          {t(
            "export.noHistoryDesc",
            "Reports exported in PDF or Excel formats will be archived here for instant re-download."
          )}
        </p>
      </div>
    );
  }

  // ── History table ──
  return (
    <div className="w-full space-y-4">

      {/* Table */}
      <div className="overflow-hidden rounded-xl
        border border-gray-200 dark:border-[#30363d]
        bg-white dark:bg-[#161b22] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-[#30363d]
              bg-gray-50 dark:bg-[#1c2129]">
              <th className="py-3 px-4 text-[11px] font-bold uppercase
                tracking-widest text-gray-400 dark:text-[#7d8590]">
                {t("export.format.label", "Format")}
              </th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase
                tracking-widest text-gray-400 dark:text-[#7d8590]">
                {t("export.fileName", "File Name")}
              </th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase
                tracking-widest text-gray-400 dark:text-[#7d8590]">
                {t("export.date", "Generated")}
              </th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase
                tracking-widest text-gray-400 dark:text-[#7d8590]">
                {t("export.fileSize", "Size")}
              </th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase
                tracking-widest text-gray-400 dark:text-[#7d8590] text-right">
                {t("common.action", "Action")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-[#30363d]">
            {history.map((item) => (
              <tr
                key={item.exportId || item.id}
                className="hover:bg-gray-50 dark:hover:bg-[#1c2129]
                  transition-all duration-200"
              >
                {/* Format badge */}
                <td className="py-3 px-4">
                  {getFormatBadge(item.format)}
                </td>

                {/* File name */}
                <td className="py-3 px-4 text-sm font-medium
                  text-gray-900 dark:text-[#e6edf3]">
                  {item.fileName || `Report_${item.reportId}`}
                </td>

                {/* Date */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5
                    text-xs text-gray-500 dark:text-[#7d8590]">
                    <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                    <span>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : t("export.history.recently", "Recently")}
                    </span>
                  </div>
                </td>

                {/* File size */}
                <td className="py-3 px-4 text-xs
                  text-gray-500 dark:text-[#7d8590] font-mono">
                  {formatBytes(item.fileSizeBytes || 245000)}
                </td>

                {/* Download action */}
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      onDownloadItem &&
                      onDownloadItem(item.exportId || item.id, item.fileName)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5
                      rounded-lg text-xs font-semibold
                      text-gray-700 dark:text-[#e6edf3]
                      border border-gray-200 dark:border-[#30363d]
                      bg-white dark:bg-[#161b22]
                      hover:bg-gray-50 dark:hover:bg-[#1c2129]
                      transition-all duration-200"
                  >
                    <Download className="w-3.5 h-3.5 text-[#22C55E]"
                      strokeWidth={2} />
                    {t("export.download", "Download")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-500 dark:text-[#7d8590] tabular-nums">
            {t("export.history.pagination", "Page {{current}} of {{total}}", {
              current: page + 1,
              total: totalPages,
            })}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange && onPageChange(page - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5
                rounded-lg text-xs font-semibold
                text-gray-700 dark:text-[#e6edf3]
                border border-gray-200 dark:border-[#30363d]
                hover:bg-gray-50 dark:hover:bg-[#1c2129]
                transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.25} />
              {t("report.list.pagination.prev", "Previous")}
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange && onPageChange(page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5
                rounded-lg text-xs font-semibold
                text-gray-700 dark:text-[#e6edf3]
                border border-gray-200 dark:border-[#30363d]
                hover:bg-gray-50 dark:hover:bg-[#1c2129]
                transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("report.list.pagination.next", "Next")}
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}