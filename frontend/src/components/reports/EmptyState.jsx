// src/components/reports/EmptyState.jsx
// ---------------------------------------------------------------------------
// Empty state for filtered/unfiltered report list views.
// Handles: no reports at all | no results for filter/search
// ---------------------------------------------------------------------------

"use client";

import { motion } from "framer-motion";
import { FileSearch, FilePlus, AlertCircle } from "lucide-react";
import Link from "next/link";

/**
 * @param {{
 *   variant?: "no-reports"|"no-results"|"error",
 *   filterLabel?: string,   // e.g. "Completed" — shown in "No Completed reports"
 *   searchQuery?: string,   // if set, shows search-specific copy
 *   onClearFilters?: () => void,
 * }} props
 */
export default function EmptyState({
  variant = "no-results",
  filterLabel = "",
  searchQuery = "",
  onClearFilters,
}) {
  const config = {
    "no-reports": {
      Icon: FilePlus,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/8",
      iconBorder: "border-emerald-500/20",
      title: "No reports yet",
      subtitle:
        "Generate your first due diligence report to get started. Analysis takes about 30 seconds.",
      cta: (
        <Link
          href="/generate"
          className="
            inline-flex items-center gap-2 px-4 py-2 rounded-lg
            bg-emerald-500 hover:bg-emerald-400
            text-slate-950 text-sm font-semibold
            transition-colors duration-150
            focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
          "
        >
          <FilePlus size={14} strokeWidth={2} aria-hidden="true" />
          Generate first report
        </Link>
      ),
    },
    "no-results": {
      Icon: FileSearch,
      iconColor: "text-slate-400",
      iconBg: "bg-slate-800/40",
      iconBorder: "border-slate-700/40",
      title: searchQuery
        ? `No results for "${searchQuery}"`
        : filterLabel
        ? `No ${filterLabel.toLowerCase()} reports`
        : "No reports match your filters",
      subtitle: searchQuery
        ? "Try a different search term or clear your filters to see all reports."
        : filterLabel
        ? `You don't have any ${filterLabel.toLowerCase()} reports yet. Try a different filter or generate a new report.`
        : "Try adjusting your filters or search to find what you're looking for.",
      cta: (
        <div className="flex items-center gap-3">
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="
                inline-flex items-center gap-2 px-4 py-2 rounded-lg
                bg-slate-800 hover:bg-slate-700
                text-slate-300 hover:text-white text-sm font-medium
                border border-slate-700/60 hover:border-slate-600
                transition-all duration-150
                focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
              "
            >
              Clear filters
            </button>
          )}
          <Link
            href="/generate"
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-lg
              bg-emerald-500/10 hover:bg-emerald-500/20
              text-emerald-400 hover:text-emerald-300 text-sm font-medium
              border border-emerald-500/20 hover:border-emerald-500/30
              transition-all duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
            "
          >
            <FilePlus size={14} strokeWidth={1.75} aria-hidden="true" />
            New report
          </Link>
        </div>
      ),
    },
    error: {
      Icon: AlertCircle,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/8",
      iconBorder: "border-red-500/20",
      title: "Failed to load reports",
      subtitle:
        "Something went wrong while fetching your reports. Please refresh the page.",
      cta: (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="
            inline-flex items-center gap-2 px-4 py-2 rounded-lg
            bg-slate-800 hover:bg-slate-700
            text-slate-300 hover:text-white text-sm font-medium
            border border-slate-700/60 hover:border-slate-600
            transition-all duration-150
            focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
          "
        >
          Refresh page
        </button>
      ),
    },
  };

  const { Icon, iconColor, iconBg, iconBorder, title, subtitle, cta } =
    config[variant] ?? config["no-results"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
      role="status"
      aria-live="polite"
    >
      {/* Icon container */}
      <div
        className={`
          flex items-center justify-center w-16 h-16 rounded-2xl mb-5
          border ${iconBg} ${iconBorder}
        `}
        aria-hidden="true"
      >
        <Icon size={28} strokeWidth={1.5} className={iconColor} />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-100 mb-2 tracking-tight">
        {title}
      </h3>

      {/* Subtitle */}
      <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
        {subtitle}
      </p>

      {/* CTA(s) */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {cta}
      </div>
    </motion.div>
  );
}