// src/components/reports/InlineActions.jsx
// ---------------------------------------------------------------------------
// Hover-revealed inline action buttons for each report row.
// Visibility: opacity-0 at rest → opacity-100 on parent hover.
// The parent row must have `group` class on its container.
// ---------------------------------------------------------------------------

"use client";

import { useCallback } from "react";
import { Eye, FileText, Sheet, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * @param {{
 *   report: {
 *     id: number,
 *     title: string,
 *     status: "PENDING"|"GENERATING"|"COMPLETED"|"FAILED",
 *     propertyAddress: string,
 *   },
 *   onDownloadPdf: (reportId: number, filename: string) => Promise<void>,
 *   onDownloadExcel: (reportId: number, filename: string) => Promise<void>,
 *   onMenuOpen: (reportId: number, event: React.MouseEvent) => void,
 *   isExporting?: boolean,
 * }} props
 */
export default function InlineActions({
  report,
  onDownloadPdf,
  onDownloadExcel,
  onMenuOpen,
  isExporting = false,
}) {
  const router = useRouter();

  const isCompleted = report.status === "COMPLETED";

  // Sanitise filename — strip special chars, replace spaces with underscores
  const safeAddress = (report.propertyAddress || `report_${report.id}`)
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase()
    .slice(0, 40);

  const pdfFilename = `due_diligence_${safeAddress}.pdf`;
  const excelFilename = `due_diligence_${safeAddress}.xlsx`;

  const handleView = useCallback((e) => {
    e.stopPropagation();
    router.push(`/reports/${report.id}`);
  }, [router, report.id]);

  const handlePdf = useCallback(async (e) => {
    e.stopPropagation();
    if (!isCompleted || isExporting) return;
    await onDownloadPdf(report.id, pdfFilename);
  }, [isCompleted, isExporting, onDownloadPdf, report.id, pdfFilename]);

  const handleExcel = useCallback(async (e) => {
    e.stopPropagation();
    if (!isCompleted || isExporting) return;
    await onDownloadExcel(report.id, excelFilename);
  }, [isCompleted, isExporting, onDownloadExcel, report.id, excelFilename]);

  const handleMenu = useCallback((e) => {
    e.stopPropagation();
    onMenuOpen(report.id, e);
  }, [onMenuOpen, report.id]);

  return (
    /*
     * Container is ALWAYS in the DOM (no conditional render).
     * Visibility toggled via opacity + pointer-events on group-hover.
     * This prevents layout shift.
     */
    <div
      className={`
        flex items-center gap-1
        opacity-0 group-hover:opacity-100
        transition-opacity duration-150
      `}
      // Prevent row click from firing when clicking actions
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── View Report ────────────────────────────────────────────── */}
      <ActionButton
        icon={Eye}
        label="View report"
        onClick={handleView}
        title="View report"
      />

      {/* ── Download PDF ───────────────────────────────────────────── */}
      <ActionButton
        icon={FileText}
        label="Download PDF"
        onClick={handlePdf}
        title={isCompleted ? "Download PDF" : "Report not yet complete"}
        disabled={!isCompleted || isExporting}
      />

      {/* ── Download Excel ─────────────────────────────────────────── */}
      <ActionButton
        icon={Sheet}
        label="Download Excel"
        onClick={handleExcel}
        title={isCompleted ? "Download Excel" : "Report not yet complete"}
        disabled={!isCompleted || isExporting}
      />

      {/* ── Visual divider ─────────────────────────────────────────── */}
      <div className="w-px h-4 bg-slate-700/60 mx-0.5" aria-hidden="true" />

      {/* ── More / 3-dot menu ──────────────────────────────────────── */}
      <ActionButton
        icon={MoreHorizontal}
        label="More options"
        onClick={handleMenu}
        title="More options"
        variant="muted"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: individual icon button
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   icon: React.ComponentType,
 *   label: string,
 *   onClick: (e: React.MouseEvent) => void,
 *   title?: string,
 *   disabled?: boolean,
 *   variant?: "default"|"muted",
 * }} props
 */
function ActionButton({ icon: Icon, label, onClick, title, disabled = false, variant = "default" }) {
  const baseClasses = `
    relative flex items-center justify-center
    w-7 h-7 rounded-md
    transition-all duration-150
    focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
    disabled:opacity-30 disabled:cursor-not-allowed
  `;

  const variantClasses = disabled
    ? "text-slate-600 bg-transparent cursor-not-allowed"
    : variant === "muted"
    ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
    : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10";

  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
    >
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}