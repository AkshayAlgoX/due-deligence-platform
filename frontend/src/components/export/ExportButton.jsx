"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";

export default function ExportButton({
  onExportPdf,
  onExportExcel,
  isLoading = false,
  variant = "iconOnly",
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  // Issue 4 — outside click + Esc close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      {variant === "iconOnly" ? (
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={isLoading}
          title={t("export.download", "Export Report")}
          className="w-8 h-8 rounded-lg flex items-center justify-center
            text-gray-500 dark:text-[#7d8590]
            hover:bg-gray-100 dark:hover:bg-[#21262d]
            hover:text-gray-700 dark:hover:text-[#e6edf3]
            transition-all duration-150 relative focus:outline-none"
        >
          <Download className="w-4 h-4" strokeWidth={2} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500" />
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={isLoading}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2
            rounded-xl font-medium text-xs sm:text-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-sky-500/40
            disabled:opacity-60 disabled:cursor-not-allowed
            ${
              variant === "outline"
                ? "border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2129] shadow-xs"
                : "bg-gradient-to-br from-[#22C55E] to-[#16a34a] text-white shadow-[0_10px_30px_rgba(34,197,94,0.4)] hover:scale-[1.03] hover:shadow-[0_15px_40px_rgba(34,197,94,0.55)] active:scale-[0.97]"
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

      {/* Issue 1 — Dropdown with framer-motion entrance */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-60 rounded-xl
              bg-white dark:bg-[#161b22]
              border border-gray-200 dark:border-[#30363d]
              shadow-xl z-50 py-1.5 overflow-hidden"
          >
            {/* Dropdown Header */}
            <div className="px-3 py-1.5 border-b border-gray-100 dark:border-[#30363d]">
              <p className="text-[11px] font-bold uppercase tracking-widest
                text-gray-400 dark:text-[#7d8590]">
                {t("export.format.select", "Select Export Format")}
              </p>
            </div>

            {/* Issue 2 — PDF only (Preview removed) */}
            {onExportPdf && (
              <button
                type="button"
                onClick={() => {
                  closeDropdown();
                  onExportPdf();
                }}
                className="w-full flex items-center gap-3 px-3 py-2
                  text-gray-700 dark:text-[#e6edf3]
                  hover:bg-gray-50 dark:hover:bg-[#1c2129]
                  transition-all duration-200 text-left"
              >
                <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50
                  text-red-500 dark:text-red-400 shrink-0">
                  <FileText className="w-4 h-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {t("export.pdf", "PDF Document")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[#7d8590] mt-0.5">
                    {t("export.format.pdfDesc", "Full report with cover & graphics")}
                  </p>
                </div>
              </button>
            )}

            {/* Issue 2 — Excel only (Preview removed) */}
            {onExportExcel && (
              <button
                type="button"
                onClick={() => {
                  closeDropdown();
                  onExportExcel();
                }}
                className="w-full flex items-center gap-3 px-3 py-2
                  text-gray-700 dark:text-[#e6edf3]
                  hover:bg-gray-50 dark:hover:bg-[#1c2129]
                  transition-all duration-200 text-left"
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50
                  text-emerald-500 dark:text-emerald-400 shrink-0">
                  <FileSpreadsheet className="w-4 h-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {t("export.excel", "Excel Workbook")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[#7d8590] mt-0.5">
                    {t("export.format.excelDesc", "Multi-sheet structured dataset")}
                  </p>
                </div>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}