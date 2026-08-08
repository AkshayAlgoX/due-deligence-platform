"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  RefreshCw,
  Printer,
  Link2,
  MoreHorizontal,
  Copy,
  Trash2,
  History,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import ExportButton from "@/components/export/ExportButton";
import ExportProgressModal from "@/components/export/ExportProgressModal";
import { useExport } from "@/hooks/useExport";

function StatusDot({ status, t }) {
  const meta = {
    COMPLETED: { color: "#22C55E", key: "report.status.completed" },
    GENERATING: { color: "#3B82F6", key: "report.status.generating" },
    PENDING: { color: "#F59E0B", key: "report.status.pending" },
    FAILED: { color: "#EF4444", key: "report.status.failed" },
  };
  const s = meta[status] || { color: "#7d8590", key: "report.status.unknown" };
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: s.color }}
      />
      <span className="text-[12px] font-semibold" style={{ color: s.color }}>
        {t(s.key)}
      </span>
    </div>
  );
}

function Tooltip({ children, label }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-gray-900 dark:bg-[#0d1117] text-white text-[11px] font-medium whitespace-nowrap pointer-events-none z-50 shadow-lg">
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-[#0d1117]" />
        </div>
      )}
    </div>
  );
}

function KebabMenu({ onDelete, onVersionHistory, onRegenerate, onClose, t }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleMouseDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1.5 w-52 rounded-xl
        border border-gray-200 dark:border-[#30363d]
        bg-white dark:bg-[#161b22]
        shadow-xl z-50 overflow-hidden py-1"
    >
      <button
        onClick={() => { onVersionHistory(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2.5
          text-[13px] text-gray-700 dark:text-[#e6edf3]
          hover:bg-gray-50 dark:hover:bg-[#1c2129]
          transition-colors duration-150 text-left"
      >
        <History className="w-4 h-4 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
        {t("report.viewer.kebab.versionHistory")}
      </button>
      <button
        onClick={() => { onRegenerate(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2.5
          text-[13px] text-gray-700 dark:text-[#e6edf3]
          hover:bg-gray-50 dark:hover:bg-[#1c2129]
          transition-colors duration-150 text-left"
      >
        <Copy className="w-4 h-4 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
        {t("report.viewer.kebab.duplicate")}
      </button>
      <div className="my-1 border-t border-gray-100 dark:border-[#30363d]" />
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2.5
          text-[13px] text-red-600 dark:text-red-400
          hover:bg-red-50 dark:hover:bg-red-900/10
          transition-colors duration-150 text-left"
      >
        <Trash2 className="w-4 h-4" strokeWidth={2} />
        {t("report.viewer.kebab.delete")}
      </button>
    </div>
  );
}

export default function ReportViewerHeader({
  report,
  onRegenerate,
  onDelete,
  onVersionHistory,
  isRegenerating = false,
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [kebabOpen, setKebabOpen] = useState(false);
  const kebabRef = useRef(null);

  const {
    isGenerating,
    progressStage,
    progressPercent,
    exportFormat,
    downloadPdf,
    downloadExcel,
  } = useExport();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      const isMac = navigator.platform.includes("Mac");
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.key === "p") {
        e.preventDefault();
        handlePrint();
      }
      if (modifier && e.key === "k") {
        e.preventDefault();
        handleShare();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handlePrint() {
    window.open(`/reports/${report?.id}/print`, "_blank");
  }

  function handleShare() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success(t("report.viewer.actions.linkCopied")))
      .catch(() => toast.error(t("report.viewer.actions.linkCopyFailed")));
  }

  const address = report?.propertyAddress || report?.title || "Report";
  const generatedDate = report?.completedAt || report?.createdAt;
  const dateLabel = generatedDate
    ? new Date(generatedDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <header
      className={`
        sticky top-0 z-40 w-full
        bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-md
        border-b border-gray-200 dark:border-[#30363d]
        transition-shadow duration-200
        ${scrolled ? "shadow-sm" : ""}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 h-14">

          {/* Back button */}
          <button
            onClick={() => router.push("/reports")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
              text-gray-500 dark:text-[#7d8590]
              hover:bg-gray-100 dark:hover:bg-[#21262d]
              hover:text-gray-700 dark:hover:text-[#e6edf3]
              transition-all duration-150 flex-shrink-0
              text-[13px] font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="hidden sm:block">{t("report.viewer.back")}</span>
          </button>

          <div className="w-px h-5 bg-gray-200 dark:bg-[#30363d] flex-shrink-0" />

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[14px] font-bold text-gray-900 dark:text-[#e6edf3] truncate">
                {address}
              </h1>
              {report?.version != null && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full
                  bg-gray-100 dark:bg-[#21262d]
                  text-gray-500 dark:text-[#7d8590] flex-shrink-0">
                  v{report.version}
                </span>
              )}
              {report?.status && (
                <div className="flex-shrink-0">
                  <StatusDot status={report.status} t={t} />
                </div>
              )}
            </div>
            {dateLabel && (
              <p className="text-[11px] text-gray-400 dark:text-[#6e7681] hidden sm:block">
                {t("report.viewer.meta.generated", { date: dateLabel })}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Regenerate */}
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-[12px] font-semibold
                bg-blue-50 dark:bg-blue-900/20
                text-blue-600 dark:text-blue-400
                border border-blue-200 dark:border-blue-800/40
                hover:bg-blue-100 dark:hover:bg-blue-900/30
                transition-all duration-150
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRegenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} />
              )}
              {isRegenerating
                ? t("report.viewer.actions.regenerating")
                : t("report.viewer.actions.regenerate")}
            </button>

            {/* Print */}
            <Tooltip label={t("report.viewer.actions.printShortcut")}>
              <button
                onClick={handlePrint}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                  text-gray-500 dark:text-[#7d8590]
                  hover:bg-gray-100 dark:hover:bg-[#21262d]
                  hover:text-gray-700 dark:hover:text-[#e6edf3]
                  transition-all duration-150"
              >
                <Printer className="w-4 h-4" strokeWidth={2} />
              </button>
            </Tooltip>

            {/* Share */}
            <Tooltip label={t("report.viewer.actions.shareShortcut")}>
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                  text-gray-500 dark:text-[#7d8590]
                  hover:bg-gray-100 dark:hover:bg-[#21262d]
                  hover:text-gray-700 dark:hover:text-[#e6edf3]
                  transition-all duration-150"
              >
                <Link2 className="w-4 h-4" strokeWidth={2} />
              </button>
            </Tooltip>

            {/* Export — Issue 2: onPreview removed */}
            <ExportButton
              onExportPdf={() => report?.id && downloadPdf(report.id)}
              onExportExcel={() => report?.id && downloadExcel(report.id)}
              isLoading={isGenerating}
              variant="iconOnly"
            />

            {/* Kebab menu */}
            <div className="relative" ref={kebabRef}>
              <Tooltip label={t("report.viewer.actions.moreOptions")}>
                <button
                  onClick={() => setKebabOpen((o) => !o)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center
                    transition-all duration-150 ${
                    kebabOpen
                      ? "bg-gray-100 dark:bg-[#21262d] text-gray-700 dark:text-[#e6edf3]"
                      : "text-gray-500 dark:text-[#7d8590] hover:bg-gray-100 dark:hover:bg-[#21262d] hover:text-gray-700 dark:hover:text-[#e6edf3]"
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
                </button>
              </Tooltip>
              {kebabOpen && (
                <KebabMenu
                  onDelete={onDelete}
                  onVersionHistory={onVersionHistory}
                  onRegenerate={onRegenerate}
                  onClose={() => setKebabOpen(false)}
                  t={t}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Progress Modal */}
      <ExportProgressModal
        isOpen={isGenerating}
        stage={progressStage}
        percent={progressPercent}
        format={exportFormat}
      />

      {/* ExportPreviewModal intentionally removed (Issue 2)
          Preview was redundant — report TOC sidebar shows all sections */}
    </header>
  );
}