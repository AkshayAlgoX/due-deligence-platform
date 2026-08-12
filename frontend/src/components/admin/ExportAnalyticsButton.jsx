"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportDashboardAnalytics } from "@/services/adminService";

export default function ExportAnalyticsButton({ defaultFormat = "excel" }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState(defaultFormat);

  const formats = [
    {
      value: "excel",
      label: t("nav.admin.exportFormatExcel"),
    },
    {
      value: "csv",
      label: t("nav.admin.exportFormatCsv"),
    },
    {
      value: "pdf",
      label: t("nav.admin.exportFormatPdf"),
    },
  ];

  const handleExport = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const SUPPORTED = new Set(["en","hi","bn","gu","kn","ml","mr","pa","ta","te","ur"]);
      const base = (i18n.language ?? "en").slice(0, 2).toLowerCase();
      const language = SUPPORTED.has(base) ? base : "en";

      const blob = await exportDashboardAnalytics(
        format,
        language
      );

      if (!blob || blob.size === 0) {
        throw new Error("Empty export file");
      }

      const extensionMap = {
        excel: "xlsx",
        csv: "csv",
        pdf: "pdf",
      };

      const extension = extensionMap[format] || "xlsx";

      const filename =
        `admin-analytics-${new Date()
          .toISOString()
          .slice(0, 10)}.${extension}`;

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Analytics export failed:", error);
      toast.error(t("nav.admin.exportFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={format}
        onChange={(event) => setFormat(event.target.value)}
        disabled={loading}
        className="rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-gray-900 dark:text-[#e6edf3] px-3 py-2 text-sm disabled:opacity-50"
      >
        {formats.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-[#22C55E] hover:bg-[#1ca34e] px-4 py-2 text-sm font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />
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