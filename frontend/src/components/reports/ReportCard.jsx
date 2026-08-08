// src/components/reports/ReportCard.jsx
// ---------------------------------------------------------------------------
// Premium report list row — risk badge + inline hover actions + relative time
// Matches Linear/Vercel/Stripe dashboard density and hierarchy.
// ---------------------------------------------------------------------------

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader2,
  AlertCircle,
  Clock,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import RiskScoreBadge from "@/components/reports/RiskScoreBadge";
import InlineActions from "@/components/reports/InlineActions";
import { formatRelativeTime, formatAbsoluteDate } from "@/utils/formatDate";

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  COMPLETED: {
    label: "Completed",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    pulse: false,
  },
  GENERATING: {
    label: "Generating",
    dot: "bg-blue-400",
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    pulse: true,
  },
  PENDING: {
    label: "Pending",
    dot: "bg-amber-400",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    pulse: true,
  },
  FAILED: {
    label: "Failed",
    dot: "bg-red-400",
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    pulse: false,
  },
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   report: {
 *     id: number,
 *     title: string,
 *     propertyAddress: string,
 *     status: "PENDING"|"GENERATING"|"COMPLETED"|"FAILED",
 *     version: number,
 *     riskScoreSnapshot: number|null,
 *     riskLevelSnapshot: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"|null,
 *     sectionCount: number,
 *     createdAt: string,
 *     updatedAt: string,
 *     errorMessage: string|null,
 *   },
 *   onDownloadPdf: (reportId: number, filename: string) => Promise<void>,
 *   onDownloadExcel: (reportId: number, filename: string) => Promise<void>,
 *   onDelete: (reportId: number) => void,
 *   onRegenerate: (reportId: number) => void,
 *   isExporting?: boolean,
 *   animationDelay?: number,
 * }} props
 */
export default function ReportCard({
  report,
  onDownloadPdf,
  onDownloadExcel,
  onDelete,
  onRegenerate,
  isExporting = false,
  animationDelay = 0,
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const statusCfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.PENDING;
  const isCompleted = report.status === "COMPLETED";
  const isFailed = report.status === "FAILED";
  const isProcessing = report.status === "PENDING" || report.status === "GENERATING";

  // ── Context menu close on outside click ──────────────────────────────
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  // ── Navigation ────────────────────────────────────────────────────────
  const handleRowClick = useCallback(() => {
    if (isCompleted) router.push(`/reports/${report.id}`);
  }, [isCompleted, router, report.id]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleRowClick();
      }
    },
    [handleRowClick]
  );

  // ── Menu open handler ────────────────────────────────────────────────
  const handleMenuOpen = useCallback(() => {
    setMenuOpen((o) => !o);
  }, []);

  // ── Row icon ─────────────────────────────────────────────────────────
  const RowIcon = isFailed
    ? AlertCircle
    : isProcessing
    ? Loader2
    : FileText;

  const iconClass = isFailed
    ? "text-red-400"
    : isProcessing
    ? "text-blue-400 animate-spin"
    : "text-slate-400";

  // ── Timestamps ───────────────────────────────────────────────────────
  const relativeTime = formatRelativeTime(report.createdAt);
  const absoluteTime = formatAbsoluteDate(report.createdAt);
  const updatedRelative = report.updatedAt ? formatRelativeTime(report.updatedAt) : null;

  // ── Address display ───────────────────────────────────────────────────
  // Title is "Due Diligence: {address}" — extract address after colon for
  // cleaner display, or fall back to propertyAddress
  const displayAddress = report.propertyAddress || report.title || "Unknown property";
  const displayTitle = report.title || `Report #${report.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: animationDelay, ease: "easeOut" }}
      // `group` enables child group-hover: selectors
      className={`
        group relative flex items-center gap-4 px-5 py-4
        rounded-xl border
        bg-slate-900/50 hover:bg-slate-900/80
        border-slate-800/60 hover:border-slate-700/80
        transition-all duration-150 cursor-default
        ${isCompleted ? "cursor-pointer" : ""}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40
      `}
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      tabIndex={isCompleted ? 0 : undefined}
      role={isCompleted ? "link" : undefined}
      aria-label={isCompleted ? `View report: ${displayTitle}` : displayTitle}
    >
      {/* ── Left: Row icon ────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700/40"
        aria-hidden="true"
      >
        <RowIcon size={16} strokeWidth={1.75} className={iconClass} />
      </div>

      {/* ── Centre: Title + meta ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-sm font-semibold text-slate-100 truncate leading-tight">
            {displayAddress}
          </span>

          {/* Version badge */}
          <span className="flex-shrink-0 text-[10px] font-medium text-slate-500 bg-slate-800/60 border border-slate-700/40 px-1.5 py-0.5 rounded">
            v{report.version ?? 1}
          </span>

          {/* Status pill */}
          <StatusPill status={report.status} config={statusCfg} />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {/* Section count (if completed) */}
          {isCompleted && report.sectionCount > 0 && (
            <span className="text-xs text-slate-500">
              {report.sectionCount} sections
            </span>
          )}

          {/* Error message (if failed) */}
          {isFailed && report.errorMessage && (
            <span className="text-xs text-red-400/80 truncate max-w-xs">
              {report.errorMessage}
            </span>
          )}

          {/* Timestamp */}
          <span
            className="flex items-center gap-1 text-xs text-slate-500"
            title={absoluteTime}
          >
            <Clock size={10} strokeWidth={1.75} aria-hidden="true" />
            <time dateTime={report.createdAt}>{relativeTime}</time>
          </span>

          {/* Updated (if different from created) */}
          {updatedRelative && updatedRelative !== relativeTime && (
            <span className="text-xs text-slate-600">
              Updated {updatedRelative}
            </span>
          )}
        </div>
      </div>

      {/* ── Right: Risk badge + inline actions ───────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-3">
        {/* Risk score badge */}
        <RiskScoreBadge
          score={report.riskScoreSnapshot}
          level={report.riskLevelSnapshot}
          status={report.status}
          size="md"
        />

        {/* Inline hover actions — always in DOM, opacity toggled via group-hover */}
        <InlineActions
          report={report}
          onDownloadPdf={onDownloadPdf}
          onDownloadExcel={onDownloadExcel}
          onMenuOpen={handleMenuOpen}
          isExporting={isExporting}
        />
      </div>

      {/* ── Context menu (tertiary actions) ──────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="
              absolute right-4 top-full mt-1.5 z-50
              w-52 rounded-xl overflow-hidden
              bg-slate-900 border border-slate-700/80
              shadow-2xl shadow-black/50
            "
            role="menu"
            aria-label="Report options"
          >
            {/* View */}
            {isCompleted && (
              <ContextMenuItem
                icon={ExternalLink}
                label="View report"
                onClick={() => {
                  setMenuOpen(false);
                  router.push(`/reports/${report.id}`);
                }}
              />
            )}

            {/* Regenerate */}
            {(isFailed || isCompleted) && onRegenerate && (
              <ContextMenuItem
                icon={RefreshCw}
                label="Regenerate"
                onClick={() => {
                  setMenuOpen(false);
                  onRegenerate(report.id);
                }}
              />
            )}

            {/* Copy ID */}
            <ContextMenuItem
              icon={Copy}
              label="Copy report ID"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(String(report.id))
                  .catch(() => {});
                setMenuOpen(false);
              }}
            />

            {/* Divider */}
            <div className="h-px bg-slate-800/80 my-1" aria-hidden="true" />

            {/* Delete */}
            {onDelete && (
              <ContextMenuItem
                icon={Trash2}
                label="Delete report"
                variant="danger"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(report.id);
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// StatusPill sub-component
// ---------------------------------------------------------------------------

function StatusPill({ status, config }) {
  return (
    <span
      className={`
        flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md
        text-[11px] font-medium border
        ${config.bg} ${config.border} ${config.text}
      `}
      aria-label={`Status: ${config.label}`}
    >
      {/* Dot */}
      <span className="relative flex items-center justify-center w-1.5 h-1.5 flex-shrink-0">
        {config.pulse && (
          <span
            className={`absolute inline-flex w-full h-full rounded-full opacity-50 animate-ping ${config.dot}`}
            aria-hidden="true"
          />
        )}
        <span
          className={`relative inline-flex w-1.5 h-1.5 rounded-full ${config.dot}`}
          aria-hidden="true"
        />
      </span>
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ContextMenuItem sub-component
// ---------------------------------------------------------------------------

function ContextMenuItem({ icon: Icon, label, onClick, variant = "default" }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full px-3.5 py-2.5
        text-sm text-left
        transition-colors duration-100
        focus:outline-none focus-visible:bg-slate-800/60
        ${
          variant === "danger"
            ? "text-red-400 hover:text-red-300 hover:bg-red-500/8"
            : "text-slate-300 hover:text-white hover:bg-slate-800/60"
        }
      `}
    >
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </button>
  );
}