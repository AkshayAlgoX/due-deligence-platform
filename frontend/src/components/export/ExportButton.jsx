"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, FileText, FileSpreadsheet, Eye, ChevronDown } from "lucide-react";

export default function ExportButton({
  onExportPdf,
  onExportExcel,
  onPreview,
  isLoading = false,
  variant = "iconOnly", // "iconOnly" | "primary" | "secondary" | "outline"
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="relative inline-block text-left">
      {variant === "iconOnly" ? (
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={isLoading}
          title={t("export.download", "Export Report")}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-[#7d8590] hover:bg-gray-100 dark:hover:bg-[#21262d] hover:text-gray-700 dark:hover:text-[#e6edf3] transition-all duration-150 relative focus:outline-none"
        >
          <Download className="w-4 h-4" strokeWidth={2} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500" />
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={isLoading}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:opacity-60 disabled:cursor-not-allowed ${
            variant === "outline"
              ? "border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-xs"
              : "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-md"
          }`}
        >
          <Download className="w-4 h-4" />
          <span>{t("export.download", "Export Report")}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeDropdown}
          />

          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-1.5 border-b border-gray-100 dark:border-[#30363d]">
              <p className="text-[11px] font-semibold text-gray-400 dark:text-[#7d8590] uppercase tracking-wider">
                {t("export.format.select", "Select Export Format")}
              </p>
            </div>

            {onExportPdf && (
              <button
                type="button"
                onClick={() => {
                  closeDropdown();
                  onExportPdf();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors text-left"
              >
                <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold leading-none">
                    {t("export.pdf", "PDF Document")}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-[#7d8590] mt-0.5">
                    {t("export.format.pdfDesc", "Full report with cover & graphics")}
                  </p>
                </div>
              </button>
            )}

            {onExportExcel && (
              <button
                type="button"
                onClick={() => {
                  closeDropdown();
                  onExportExcel();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors text-left"
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold leading-none">
                    {t("export.excel", "Excel Workbook")}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-[#7d8590] mt-0.5">
                    {t("export.format.excelDesc", "Multi-sheet structured dataset")}
                  </p>
                </div>
              </button>
            )}

            {onPreview && (
              <div className="pt-1 mt-1 border-t border-gray-100 dark:border-[#30363d]">
                <button
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onPreview();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 text-xs sm:text-sm text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors text-left"
                >
                  <Eye className="w-4 h-4 text-gray-400 dark:text-[#7d8590]" />
                  <span>{t("export.preview", "Preview Document")}</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
