// src/components/reports/EmptyState.jsx
// ---------------------------------------------------------------------------
// Empty state — no-reports / no-results / error variants
// ✓ Full light/dark mode
// ✓ Routes to /dashboard/property-search for new report CTA
// ---------------------------------------------------------------------------

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Search, AlertTriangle, Plus, RefreshCw } from "lucide-react";

const VARIANTS = {
  "no-reports": {
    icon: FileText,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    title: "No reports yet",
    description: "Generate your first due diligence report by selecting a property.",
    primaryLabel: "Create your first report",
    primaryIcon: Plus,
    primaryHref: "/dashboard/property-search",
  },
  "no-results": {
    icon: Search,
    iconColor: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-100 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20",
    title: "No matching reports",
    description: "Try adjusting your filters or search query.",
  },
  "error": {
    icon: AlertTriangle,
    iconColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-500/10 border-red-500/20",
    title: "Couldn't load reports",
    description: "Something went wrong. Please try again.",
    primaryLabel: "Retry",
    primaryIcon: RefreshCw,
    primaryOnClick: () => window.location.reload(),
  },
};

export default function EmptyState({
  variant = "no-reports",
  filterLabel,
  searchQuery,
  onClearFilters,
}) {
  const v = VARIANTS[variant] ?? VARIANTS["no-reports"];
  const Icon = v.icon;
  const PrimaryIcon = v.primaryIcon;

  // Custom description for no-results
  let description = v.description;
  if (variant === "no-results") {
    if (filterLabel && searchQuery) {
      description = `No ${filterLabel} reports match "${searchQuery}".`;
    } else if (filterLabel) {
      description = `No reports with status "${filterLabel}".`;
    } else if (searchQuery) {
      description = `No reports match "${searchQuery}".`;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center px-6 py-16 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.015]"
    >
      {/* Icon */}
      <div
        className={`flex items-center justify-center w-14 h-14 rounded-2xl border ${v.iconBg} mb-4`}
        aria-hidden="true"
      >
        <Icon size={26} strokeWidth={1.5} className={v.iconColor} />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
        {v.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2.5 flex-wrap justify-center">
        {variant === "no-results" && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            Clear filters
          </button>
        )}

        {v.primaryHref && (
          <Link
            href={v.primaryHref}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold shadow-md shadow-emerald-900/30 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          >
            {PrimaryIcon && <PrimaryIcon size={14} strokeWidth={2.5} aria-hidden="true" />}
            {v.primaryLabel}
          </Link>
        )}

        {v.primaryOnClick && (
          <button
            type="button"
            onClick={v.primaryOnClick}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold shadow-md shadow-emerald-900/30 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          >
            {PrimaryIcon && <PrimaryIcon size={14} strokeWidth={2.5} aria-hidden="true" />}
            {v.primaryLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}