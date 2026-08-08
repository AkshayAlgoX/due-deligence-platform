// src/components/reports/FilterBar.jsx
// ---------------------------------------------------------------------------
// Search + status filter chips + sort dropdown + results count
// All state driven by props — page.jsx owns the state
// ---------------------------------------------------------------------------

"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "COMPLETED", label: "Completed" },
  { key: "GENERATING", label: "Generating" },
  { key: "PENDING", label: "Pending" },
  { key: "FAILED", label: "Failed" },
];

export const SORT_OPTIONS = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "risk-high", label: "Highest risk" },
  { key: "risk-low", label: "Lowest risk" },
  { key: "address-az", label: "Address A–Z" },
  { key: "address-za", label: "Address Z–A" },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   searchQuery: string,
 *   onSearchChange: (q: string) => void,
 *   activeStatus: string,
 *   onStatusChange: (status: string) => void,
 *   sortKey: string,
 *   onSortChange: (key: string) => void,
 *   totalCount: number,
 *   filteredCount: number,
 * }} props
 */
export default function FilterBar({
  searchQuery,
  onSearchChange,
  activeStatus,
  onStatusChange,
  sortKey,
  onSortChange,
  totalCount,
  filteredCount,
}) {
  const searchRef = useRef(null);
  const [sortOpen, setSortOpen] = useState(false);
  const sortButtonRef = useRef(null);
  const sortMenuRef = useRef(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    function handleClick(e) {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(e.target) &&
        sortButtonRef.current &&
        !sortButtonRef.current.contains(e.target)
      ) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [sortOpen]);

  // Close sort dropdown on Escape
  useEffect(() => {
    if (!sortOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") setSortOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [sortOpen]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? "Newest first";

  const hasActiveFilter = activeStatus !== "ALL" || searchQuery.trim().length > 0;

  // Results summary text
  const resultsSummary = (() => {
    if (!hasActiveFilter) return `Showing all ${totalCount} reports`;
    const parts = [];
    if (activeStatus !== "ALL") {
      const label = STATUS_FILTERS.find((f) => f.key === activeStatus)?.label;
      if (label) parts.push(label);
    }
    if (searchQuery.trim()) parts.push(`"${searchQuery.trim()}"`);
    const filterSummary = parts.length ? ` · Filtered: ${parts.join(", ")}` : "";
    return `Showing ${filteredCount} of ${totalCount} reports${filterSummary}`;
  })();

  const handleClearSearch = useCallback(() => {
    onSearchChange("");
    searchRef.current?.focus();
  }, [onSearchChange]);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Row 1: Search + Sort ───────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by address or title…"
            aria-label="Search reports"
            className="
              w-full h-9 pl-9 pr-8 rounded-lg
              bg-slate-900/60 border border-slate-800/80
              text-sm text-slate-200 placeholder:text-slate-600
              focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50
              transition-colors duration-150
            "
          />
          {/* Clear button */}
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="
                  absolute right-2.5 top-1/2 -translate-y-1/2
                  flex items-center justify-center w-4 h-4 rounded-full
                  text-slate-500 hover:text-slate-300
                  transition-colors duration-150
                "
              >
                <X size={11} strokeWidth={2.5} aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Sort dropdown */}
        <div className="relative flex-shrink-0">
          <button
            ref={sortButtonRef}
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            aria-label={`Sort: ${activeSortLabel}`}
            className="
              flex items-center gap-2 h-9 px-3 rounded-lg
              bg-slate-900/60 border border-slate-800/80
              text-sm text-slate-300 hover:text-white
              hover:border-slate-700
              transition-all duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
              whitespace-nowrap
            "
          >
            <span className="text-slate-500 text-xs font-medium">Sort:</span>
            <span>{activeSortLabel}</span>
            <ChevronDown
              size={12}
              strokeWidth={2}
              className={`text-slate-500 transition-transform duration-150 ${
                sortOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {/* Sort dropdown menu */}
          <AnimatePresence>
            {sortOpen && (
              <motion.div
                ref={sortMenuRef}
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                role="listbox"
                aria-label="Sort options"
                className="
                  absolute right-0 top-full mt-1.5 z-50
                  w-48 rounded-xl overflow-hidden
                  bg-slate-900 border border-slate-700/80
                  shadow-2xl shadow-black/40
                "
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    role="option"
                    aria-selected={sortKey === opt.key}
                    onClick={() => {
                      onSortChange(opt.key);
                      setSortOpen(false);
                    }}
                    className={`
                      flex items-center justify-between w-full px-3.5 py-2.5
                      text-sm text-left
                      transition-colors duration-100
                      ${
                        sortKey === opt.key
                          ? "text-emerald-400 bg-emerald-500/8"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                      }
                    `}
                  >
                    {opt.label}
                    {sortKey === opt.key && (
                      <Check
                        size={13}
                        strokeWidth={2.5}
                        className="text-emerald-400"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Row 2: Status filter chips ─────────────────────────────── */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none"
        role="group"
        aria-label="Filter by status"
      >
        {STATUS_FILTERS.map((filter) => {
          const isActive = activeStatus === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => onStatusChange(filter.key)}
              aria-pressed={isActive}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-xs font-medium whitespace-nowrap flex-shrink-0
                border transition-all duration-150
                focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
                ${
                  isActive
                    ? "bg-emerald-500/12 border-emerald-500/30 text-emerald-400"
                    : "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-700/80 hover:bg-slate-800/40"
                }
              `}
            >
              {/* Status dot — pulses for active processing states */}
              <StatusDot status={filter.key} isChipActive={isActive} />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* ── Row 3: Results count ───────────────────────────────────── */}
      <p className="text-xs text-slate-500 leading-none" aria-live="polite" aria-atomic="true">
        {resultsSummary}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: status dot (with pulse for GENERATING/PENDING)
// ---------------------------------------------------------------------------

function StatusDot({ status, isChipActive }) {
  const dotColor = {
    ALL: "bg-slate-500",
    COMPLETED: "bg-emerald-400",
    GENERATING: "bg-blue-400",
    PENDING: "bg-amber-400",
    FAILED: "bg-red-400",
  }[status] ?? "bg-slate-500";

  const shouldPulse = (status === "GENERATING" || status === "PENDING") && isChipActive;

  return (
    <span className="relative flex items-center justify-center w-2 h-2 flex-shrink-0">
      {shouldPulse && (
        <span
          className={`absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping ${dotColor}`}
          aria-hidden="true"
        />
      )}
      <span
        className={`relative inline-flex w-1.5 h-1.5 rounded-full ${dotColor}`}
        aria-hidden="true"
      />
    </span>
  );
}