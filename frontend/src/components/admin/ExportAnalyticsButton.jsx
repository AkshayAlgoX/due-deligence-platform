"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Download, Loader2, ChevronDown, Check, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { toast } from "sonner";
import { downloadUrl } from "@/utils/downloadUtils";

export default function ExportAnalyticsButton({ defaultFormat = "excel" }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState(defaultFormat);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const formats = [
    { value: "excel", label: "Excel", ext: ".xlsx", icon: FileSpreadsheet },
    { value: "csv",   label: "CSV",   ext: ".csv",  icon: FileType },
    { value: "pdf",   label: "PDF",   ext: ".pdf",  icon: FileText },
  ];

  const current = formats.find((f) => f.value === format) ?? formats[0];
  const CurrentIcon = current.icon;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const SUPPORTED = new Set(["en","hi","bn","gu","kn","ml","mr","pa","ta","te","ur"]);
      const base = (i18n.language ?? "en").slice(0, 2).toLowerCase();
      const language = SUPPORTED.has(base) ? base : "en";

      downloadUrl(`/api/admin/dashboard/export?format=${format}&language=${language}&period=30d`);
    } catch (error) {
      console.error("Analytics export failed:", error);
      toast.error(t("nav.admin.exportFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Custom Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] hover:bg-gray-50 dark:hover:bg-[#161b22] px-3 py-2 text-sm font-medium text-gray-700 dark:text-[#e6edf3] transition-all min-w-[130px]"
        >
          <CurrentIcon className="h-4 w-4 text-gray-500 dark:text-[#7d8590]" />
          <span>{current.label}</span>
          <span className="text-xs text-gray-400 dark:text-[#7d8590]">{current.ext}</span>
          <ChevronDown className={`h-3.5 w-3.5 ml-auto text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-full min-w-[180px] rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-lg overflow-hidden z-50">
            {formats.map((f) => {
              const Icon = f.icon;
              const active = f.value === format;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => {
                    setFormat(f.value);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                      : "text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2128]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{f.label}</span>
                  <span className="text-xs text-gray-400 dark:text-[#7d8590]">{f.ext}</span>
                  {active && <Check className="h-4 w-4 ml-auto text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Export button */}
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>{t("nav.admin.exporting")}</span>
          </>
        ) : (
          <>
            <Download size={16} />
            <span>{t("nav.admin.export")}</span>
          </>
        )}
      </button>
    </div>
  );
}