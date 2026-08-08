"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
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

const MIN_LOADER_MS = 400;

function useMinLoadingTime(isLoading, minMs = MIN_LOADER_MS) {
  const [displayLoading, setDisplayLoading] = useState(isLoading);
  const startedAtRef = useRef(isLoading ? Date.now() : null);

  useEffect(() => {
    // Loading just started
    if (isLoading) {
      startedAtRef.current = Date.now();
      // Only update state if not already showing loader
      setDisplayLoading((prev) => (prev ? prev : true));
      return;
    }

    // Loading finished — hold for minimum duration
    const elapsed = startedAtRef.current
      ? Date.now() - startedAtRef.current
      : minMs;
    const remaining = Math.max(0, minMs - elapsed);

    const timer = setTimeout(() => {
      setDisplayLoading(false);
    }, remaining);

    return () => clearTimeout(timer);
  }, [isLoading, minMs]);

  return displayLoading;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-[#30363d] last:border-b-0">
      <td className="py-3 px-4">
        <div className="h-6 w-16 rounded-lg bg-gray-100 dark:bg-[#1c2129] animate-pulse" />
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-48 rounded bg-gray-100 dark:bg-[#1c2129] animate-pulse" />
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-24 rounded bg-gray-100 dark:bg-[#1c2129] animate-pulse" />
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-16 rounded bg-gray-100 dark:bg-[#1c2129] animate-pulse" />
      </td>
      <td className="py-3 px-4 text-right">
        <div className="h-7 w-24 rounded-lg bg-gray-100 dark:bg-[#1c2129] animate-pulse ml-auto" />
      </td>
    </tr>
  );
}

export default function ExportHistoryList({
  history = [],
  isLoading = false,
  page = 0,
  totalPages = 1,
  onPageChange,
  onDownloadItem,
}) {
  const { t } = useTranslation();
  const displayLoading = useMinLoadingTime(isLoading, MIN_LOADER_MS);
  const isFirstLoad = displayLoading && history.length === 0;
  const isPaginating = displayLoading && history.length > 0;

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

  // ── First-time loading ──
  if (isFirstLoad) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center py-16
          text-gray-400 dark:text-[#7d8590]"
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#22C55E] mb-3" strokeWidth={2} />
        <p className="text-sm font-medium">
          {t("export.loadingHistory", "Loading export history...")}
        </p>
      </motion.div>
    );
  }

  // ── Empty state ──
  if (!displayLoading && (!history || history.length === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center justify-center
          py-16 px-4 text-center
          rounded-2xl border border-dashed
          border-gray-200 dark:border-[#30363d]
          bg-gray-50/50 dark:bg-[#0d1117]"
      >
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
      </motion.div>
    );
  }

  const skeletonCount = Math.min(history.length || 5, 10);

  return (
    <div className="w-full space-y-4">

      {/* Table wrapper — animates opacity when swapping between rows/skeleton */}
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

          {/* ── Single AnimatePresence wrapping ONE keyed tbody at a time ── */}
          <AnimatePresence mode="wait" initial={false}>
            {isPaginating ? (
              <motion.tbody
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="divide-y divide-gray-100 dark:divide-[#30363d]"
              >
                {[...Array(skeletonCount)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </motion.tbody>
            ) : (
              <motion.tbody
                key={`rows-page-${page}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="divide-y divide-gray-100 dark:divide-[#30363d]"
              >
                {history.map((item) => (
                  <tr
                    key={item.exportId || item.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#1c2129]
                      transition-colors duration-200"
                  >
                    <td className="py-3 px-4">
                      {getFormatBadge(item.format)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium
                      text-gray-900 dark:text-[#e6edf3]">
                      {item.fileName || `Report_${item.reportId}`}
                    </td>
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
                    <td className="py-3 px-4 text-xs
                      text-gray-500 dark:text-[#7d8590] font-mono">
                      {formatBytes(item.fileSizeBytes || 245000)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.1 }}
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
                          transition-colors duration-200"
                      >
                        <Download className="w-3.5 h-3.5 text-[#22C55E]" strokeWidth={2} />
                        {t("export.download", "Download")}
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </motion.tbody>
            )}
          </AnimatePresence>
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
            <motion.button
              type="button"
              disabled={page === 0 || isPaginating}
              whileTap={!(page === 0 || isPaginating) ? { scale: 0.95 } : undefined}
              transition={{ duration: 0.1 }}
              onClick={() => onPageChange && onPageChange(page - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5
                rounded-lg text-xs font-semibold
                text-gray-700 dark:text-[#e6edf3]
                border border-gray-200 dark:border-[#30363d]
                hover:bg-gray-50 dark:hover:bg-[#1c2129]
                transition-colors duration-200
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.25} />
              {t("report.list.pagination.prev", "Previous")}
            </motion.button>
            <motion.button
              type="button"
              disabled={page >= totalPages - 1 || isPaginating}
              whileTap={!(page >= totalPages - 1 || isPaginating) ? { scale: 0.95 } : undefined}
              transition={{ duration: 0.1 }}
              onClick={() => onPageChange && onPageChange(page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5
                rounded-lg text-xs font-semibold
                text-gray-700 dark:text-[#e6edf3]
                border border-gray-200 dark:border-[#30363d]
                hover:bg-gray-50 dark:hover:bg-[#1c2129]
                transition-colors duration-200
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPaginating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.25} />
              ) : (
                <>
                  {t("report.list.pagination.next", "Next")}
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.25} />
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}