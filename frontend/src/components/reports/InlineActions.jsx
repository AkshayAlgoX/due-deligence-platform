// src/components/reports/InlineActions.jsx
// ---------------------------------------------------------------------------
// Hover-reveal PDF + Excel download buttons
// ✓ Always in DOM (opacity toggle — no layout shift)
// ✓ Full light/dark mode
// ---------------------------------------------------------------------------

"use client";

import { FileDown, Sheet } from "lucide-react";

export default function InlineActions({
  reportId,
  filename,
  onDownloadPdf,
  onDownloadExcel,
  isExporting,
}) {
  return (
    <div
      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      aria-label="Export actions"
    >
      {/* PDF */}
      <button
        type="button"
        onClick={() => onDownloadPdf(reportId, `${filename}.pdf`)}
        disabled={isExporting}
        aria-label="Download PDF"
        title="Download PDF"
        className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
      >
        <FileDown size={13} strokeWidth={2} aria-hidden="true" />
      </button>

      {/* Excel */}
      <button
        type="button"
        onClick={() => onDownloadExcel(reportId, `${filename}.xlsx`)}
        disabled={isExporting}
        aria-label="Download Excel"
        title="Download Excel"
        className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      >
        <Sheet size={13} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}