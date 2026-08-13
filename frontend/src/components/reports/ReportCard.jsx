// src/components/reports/ReportCard.jsx
// Dashboard design tokens: bg-[#161b22] card, border-[#30363d]

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  AlertCircle,
  Loader2,
  MoreVertical,
  Trash2,
  RefreshCw,
  ExternalLink,
  Link2,
  Clock,
  User,
  Hash,
  MapPin,
} from "lucide-react";

import RiskScoreBadge from "./RiskScoreBadge";
import InlineActions from "./InlineActions";
import { formatRelativeTime, formatAbsoluteDate } from "@/utils/formatDate";
import FraudAlertBadge from "@/components/property/FraudAlertBadge";

function getRiskBarColor(status, score) {
  if (status === "FAILED") return "#dc2626";
  if (status === "PENDING" || status === "GENERATING") return "#7d8590";
  if (score === null || score === undefined) return "#7d8590";
  if (score <= 25) return "#22C55E";
  if (score <= 50) return "#f59e0b";
  if (score <= 75) return "#ef4444";
  return "#b91c1c";
}

function StatusIconTile({ status }) {
  const base = "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl";
  if (status === "COMPLETED") {
    return (
      <div className={`${base} bg-[#edf7f3] dark:bg-[#0d2818]`}>
        <FileText size={18} strokeWidth={1.75} className="text-[#16a34a] dark:text-green-400" />
      </div>
    );
  }
  if (status === "GENERATING" || status === "PENDING") {
    return (
      <div className={`${base} bg-blue-50 dark:bg-blue-500/10`}>
        <Loader2 size={18} strokeWidth={1.75} className="text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }
  if (status === "FAILED") {
    return (
      <div className={`${base} bg-red-50 dark:bg-red-500/10`}>
        <AlertCircle size={18} strokeWidth={1.75} className="text-red-600 dark:text-red-400" />
      </div>
    );
  }
  return (
    <div className={`${base} bg-gray-100 dark:bg-[#1c2128]`}>
      <FileText size={18} strokeWidth={1.75} className="text-gray-600 dark:text-[#7d8590]" />
    </div>
  );
}

function StatusPill({ status }) {
  const variants = {
    COMPLETED: {
      dot: "bg-[#22C55E]",
      text: "text-[#16a34a] dark:text-green-400",
      bg: "bg-[#edf7f3] dark:bg-[#0d2818] border-[#22C55E]/20 dark:border-green-400/20",
      label: "Completed",
      pulse: false,
    },
    GENERATING: {
      dot: "bg-blue-500",
      text: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
      label: "Generating",
      pulse: true,
    },
    PENDING: {
      dot: "bg-blue-400",
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
      label: "Pending",
      pulse: true,
    },
    FAILED: {
      dot: "bg-red-500",
      text: "text-red-700 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
      label: "Failed",
      pulse: false,
    },
  };

  const v = variants[status] ?? {
    dot: "bg-gray-400",
    text: "text-gray-600 dark:text-[#7d8590]",
    bg: "bg-gray-50 dark:bg-[#1c2128] border-gray-200 dark:border-[#30363d]",
    label: status ?? "Unknown",
    pulse: false,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${v.bg} ${v.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${v.dot} ${v.pulse ? "animate-pulse" : ""}`} />
      {v.label}
    </span>
  );
}

function VersionPill({ version }) {
  if (!version) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#1c2128] text-[11px] font-medium text-gray-600 dark:text-[#7d8590]">
      <Hash size={9} strokeWidth={2.5} />
      v{version}
    </span>
  );
}

function MetaTrio({ report }) {
  const displayTime = report.status === "COMPLETED" && report.completedAt
    ? report.completedAt
    : report.createdAt;

  const absTime = formatAbsoluteDate(displayTime);
  const relTime = formatRelativeTime(displayTime);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span
        className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-[#7d8590]"
        title={absTime}
      >
        <Clock size={11} strokeWidth={2} className="flex-shrink-0 text-gray-400 dark:text-[#6e7681]" />
        {relTime}
      </span>

      <span className="text-gray-300 dark:text-[#30363d] text-[11px]" aria-hidden="true">·</span>

      <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-[#7d8590]">
        <Hash size={11} strokeWidth={2} className="flex-shrink-0 text-gray-400 dark:text-[#6e7681]" />
        {report.id}
      </span>

      {report.generatedByEmail && (
        <>
          <span className="text-gray-300 dark:text-[#30363d] text-[11px]" aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-[#7d8590] min-w-0">
            <User size={11} strokeWidth={2} className="flex-shrink-0 text-gray-400 dark:text-[#6e7681]" />
            <span className="truncate max-w-[160px]">{report.generatedByEmail}</span>
          </span>
        </>
      )}
    </div>
  );
}

function KebabMenuWrapper({ report, onDelete, onRegenerate, onCopyLink, onOpenChange }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  const canRegenerate = report.status === "FAILED" || report.status === "COMPLETED";

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="More actions"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 dark:text-[#7d8590] hover:text-gray-700 dark:hover:text-[#e6edf3] hover:bg-gray-100 dark:hover:bg-[#1c2128] border border-transparent hover:border-gray-200 dark:hover:border-[#30363d] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/50"
      >
        <MoreVertical size={15} strokeWidth={2} aria-hidden="true" />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.1 }}
          className="absolute right-0 top-9 z-[100] w-48 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] shadow-xl overflow-hidden"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/reports/${report.id}`);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#22282f] transition-colors duration-100"
          >
            <ExternalLink size={14} strokeWidth={1.75} className="text-gray-400 dark:text-[#7d8590]" />
            View report
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              onCopyLink(report.id);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#22282f] transition-colors duration-100"
          >
            <Link2 size={14} strokeWidth={1.75} className="text-gray-400 dark:text-[#7d8590]" />
            Copy link
          </button>

          {canRegenerate && (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                onRegenerate(report.id);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#22282f] transition-colors duration-100"
            >
              <RefreshCw size={14} strokeWidth={1.75} className="text-gray-400 dark:text-[#7d8590]" />
              Regenerate
            </button>
          )}

          <div className="h-px bg-gray-100 dark:bg-[#30363d] my-1" />

          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(report.id);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition-colors duration-100"
          >
            <Trash2 size={14} strokeWidth={1.75} />
            Delete
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function ReportCard({
  report,
  onDownloadPdf,
  onDownloadExcel,
  onDelete,
  onRegenerate,
  onCopyLink,
  isExporting,
  animationDelay = 0,
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const isCompleted = report.status === "COMPLETED";
  const barColor = getRiskBarColor(report.status, report.riskScoreSnapshot);

  const handleRowClick = useCallback(
    (e) => {
      if (e.target.closest("button") || e.target.closest("[role='menu']")) return;
      if (isCompleted) {
        router.push(`/reports/${report.id}`);
      }
    },
    [isCompleted, report.id, router]
  );

  const filename = (report.propertyAddress ?? `report-${report.id}`)
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, delay: animationDelay, ease: "easeOut" }}
      layout
      className={`relative ${menuOpen ? "z-50" : "z-0"}`}
    >
      <div
        onClick={handleRowClick}
        className={[
          "group relative flex overflow-visible rounded-2xl border transition-all duration-200 shadow-sm",
          "bg-white border-gray-100",
          "dark:bg-[#161b22] dark:border-[#30363d]",
          "hover:border-gray-200 hover:bg-gray-50/50",
          "dark:hover:border-[#3a424c] dark:hover:bg-[#1c2128]",
          "hover:shadow-md",
          isCompleted ? "cursor-pointer" : "cursor-default",
        ].join(" ")}
        role={isCompleted ? "button" : undefined}
        tabIndex={isCompleted ? 0 : undefined}
        aria-label={isCompleted ? `View report for ${report.propertyAddress ?? report.title}` : undefined}
        onKeyDown={
          isCompleted
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/reports/${report.id}`);
                }
              }
            : undefined
        }
      >
        {/* Risk color left bar */}
        <div
          className="flex-shrink-0 w-[3px] self-stretch rounded-l-2xl"
          style={{ backgroundColor: barColor }}
          aria-hidden="true"
        />

        <div className="flex items-center gap-3.5 flex-1 min-w-0 px-4 py-3.5">
          <StatusIconTile status={report.status} />

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] truncate max-w-[320px] sm:max-w-[440px]">
                {report.propertyAddress ?? report.title ?? `Report #${report.id}`}
              </span>
              <VersionPill version={report.version} />
              <StatusPill status={report.status} />
            </div>

            {report.propertyAddress && (
              <div className="flex items-center gap-1">
                <MapPin size={11} strokeWidth={2} className="flex-shrink-0 text-gray-400 dark:text-[#6e7681]" aria-hidden="true" />
                <span className="text-[11px] text-gray-500 dark:text-[#7d8590] truncate">
                  {report.title ?? report.propertyAddress}
                </span>
              </div>
            )}

            <MetaTrio report={report} />
          </div>

          <div
  className="flex items-center gap-2 flex-shrink-0 ml-2"
  onClick={(e) => e.stopPropagation()}
>
  {isCompleted && report.riskScoreSnapshot != null && (
    <FraudAlertBadge score={report.riskScoreSnapshot} size="sm" iconOnly />
  )}
  <RiskScoreBadge
    score={report.riskScoreSnapshot}
    status={report.status}
    size="sm"
  />

            {isCompleted && (
              <InlineActions
                reportId={report.id}
                filename={filename}
                onDownloadPdf={onDownloadPdf}
                onDownloadExcel={onDownloadExcel}
                isExporting={isExporting}
              />
            )}

            <KebabMenuWrapper
              report={report}
              onDelete={onDelete}
              onRegenerate={onRegenerate}
              onCopyLink={onCopyLink}
              onOpenChange={setMenuOpen}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}