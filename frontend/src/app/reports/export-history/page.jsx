// frontend/src/app/reports/export-history/page.jsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  History,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useExport } from "@/hooks/useExport";
import ExportHistoryList from "@/components/export/ExportHistoryList";

export default function ExportHistoryPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    historyData,
    isHistoryLoading,
    fetchHistory,
    downloadFromHistoryItem,
  } = useExport();

  // Fetch on mount
  useEffect(() => {
    fetchHistory(0, 10);
  }, [fetchHistory]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">

      {/* ══════════════════════════════════════════════════════════
          BREADCRUMB
      ══════════════════════════════════════════════════════════ */}
      <div className="border-b border-gray-200 dark:border-[#30363d]">
        <div className="max-w-5xl mx-auto px-6 py-3
          flex items-center gap-2 text-sm">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-1
              text-gray-500 dark:text-[#7d8590]
              hover:text-gray-900 dark:hover:text-[#e6edf3]
              transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            {t("report.list.backToDashboard", "Dashboard")}
          </button>

          <ChevronRight className="w-3.5 h-3.5
            text-gray-300 dark:text-[#484f58]" />

          <button
            onClick={() => router.push("/reports")}
            className="text-gray-500 dark:text-[#7d8590]
              hover:text-gray-900 dark:hover:text-[#e6edf3]
              transition-colors"
          >
            {t("report.list.title", "My Reports")}
          </button>

          <ChevronRight className="w-3.5 h-3.5
            text-gray-300 dark:text-[#484f58]" />

          <span className="text-gray-900 dark:text-[#e6edf3] font-medium">
            {t("export.history.pageTitle", "Export History")}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ══════════════════════════════════════════════════════════
            PAGE HEADER
        ══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row
            md:items-end md:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl
                bg-gray-900 dark:bg-white
                flex items-center justify-center">
                <History
                  className="w-5 h-5 text-white dark:text-gray-900"
                  strokeWidth={2.25}
                />
              </div>
              <h1 className="text-3xl font-black
                text-gray-900 dark:text-[#e6edf3] tracking-tight">
                {t("export.history.pageTitle", "Export History")}
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-[#7d8590] ml-13">
              {t(
                "export.history.pageSubtitle",
                "All previously exported PDF and Excel reports. Re-download anytime."
              )}
            </p>
          </div>

          {/* Back to reports — secondary button */}
          <button
            onClick={() => router.push("/reports")}
            className="inline-flex items-center gap-1.5 px-4 py-2
              rounded-xl text-sm font-semibold
              text-gray-700 dark:text-[#e6edf3]
              border border-gray-200 dark:border-[#30363d]
              bg-white dark:bg-[#161b22]
              hover:bg-gray-50 dark:hover:bg-[#1c2129]
              transition-all duration-200 self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            {t("export.history.backToReports", "Back to Reports")}
          </button>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            EXPORT HISTORY LIST
        ══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ExportHistoryList
            history={historyData?.content || []}
            isLoading={isHistoryLoading}
            page={historyData?.number || 0}
            totalPages={historyData?.totalPages || 1}
            onPageChange={(p) => fetchHistory(p, 10)}
            onDownloadItem={(id, name) => downloadFromHistoryItem(id, name)}
          />
        </motion.div>

      </div>
    </div>
  );
}