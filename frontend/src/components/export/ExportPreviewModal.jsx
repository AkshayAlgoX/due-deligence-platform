"use client";

import { useTranslation } from "react-i18next";
import { X, FileText, Layers, Eye, Download, FileSpreadsheet, Loader2 } from "lucide-react";

export default function ExportPreviewModal({
  isOpen,
  previewData,
  isLoading = false,
  onClose,
  onDownloadPdf,
  onDownloadExcel,
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white leading-none">
                {t("export.preview", "Document Preview")}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {previewData?.fileName || "Report Overview & Structure"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-3" />
              <p className="text-sm font-medium">{t("common.loading", "Loading preview...")}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
                    <FileText className="w-4 h-4 text-sky-500" />
                    <span>{t("export.estimatedPages", "Est. Pages")}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {previewData?.estimatedPages || 4} {t("export.pages", "Pages")}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span>{t("export.sections", "Sections")}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {previewData?.sectionsCount || 8} {t("export.modules", "Modules")}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
                    <Download className="w-4 h-4 text-amber-500" />
                    <span>{t("export.status", "Status")}</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {previewData?.status || "READY"}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                  {t("export.summaryTitle", "Executive Summary Preview")}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  &ldquo;{previewData?.summary || "Comprehensive property evaluation covering ownership, zoning permits, risk matrix, and market comparables."}&rdquo;
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                  {t("export.includedSections", "Included Report Modules")}
                </h4>
                <div className="space-y-2">
                  {[
                    "Cover Page & Brand Header",
                    "Executive Summary & Metadata",
                    "Property Overview & Physical Details",
                    "Risk Index Gauge & Dynamic Scoring",
                    "Comparable Market Valuation",
                    "Zoning, Flood & Environmental Verification",
                    "Appendix & Legal Disclaimers",
                  ].map((sec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1c2128] border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200"
                    >
                      <div className="w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <span>{sec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {t("common.cancel", "Close")}
          </button>

          {onDownloadExcel && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDownloadExcel();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t("export.excel", "Download Excel")}</span>
            </button>
          )}

          {onDownloadPdf && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDownloadPdf();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>{t("export.pdf", "Download PDF")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
