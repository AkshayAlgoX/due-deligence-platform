"use client";

import { useTranslation } from "react-i18next";
import { FileText, FileSpreadsheet, Download, Clock, History, Loader2 } from "lucide-react";
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          EXCEL
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-900/60">
        <FileText className="w-3.5 h-3.5" />
        PDF
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-2" />
        <p className="text-sm font-medium">{t("export.loadingHistory", "Loading export history...")}</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="p-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 mb-3">
          <History className="w-6 h-6" />
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
          {t("export.noHistory", "No Export History Yet")}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
          {t("export.noHistoryDesc", "Reports exported in PDF or Excel formats will be archived here for instant re-download.")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-sky-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            {t("export.history", "Export History")}
          </h3>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#161b22] shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-4">{t("export.format.label", "Format")}</th>
              <th className="py-3 px-4">{t("export.fileName", "File Name")}</th>
              <th className="py-3 px-4">{t("export.date", "Generated")}</th>
              <th className="py-3 px-4">{t("export.fileSize", "File Size")}</th>
              <th className="py-3 px-4 text-right">{t("common.action", "Action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {history.map((item) => (
              <tr
                key={item.exportId || item.id}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-3 px-4">{getFormatBadge(item.format)}</td>
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                  {item.fileName || `Report_${item.reportId}`}
                </td>
                <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "Recently"}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {formatBytes(item.fileSizeBytes || 245000)}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      onDownloadItem &&
                      onDownloadItem(item.exportId || item.id, item.fileName)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-500" />
                    <span>{t("export.download", "Download")}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange && onPageChange(page - 1)}
              className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-800 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange && onPageChange(page + 1)}
              className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
