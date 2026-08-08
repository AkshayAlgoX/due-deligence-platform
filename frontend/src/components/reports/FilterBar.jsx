// src/components/reports/FilterBar.jsx
// Dashboard design tokens

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, X, Check } from "lucide-react";

const STATUS_CHIPS = [
  { key: "ALL", label: "All", dot: "bg-gray-500 dark:bg-[#7d8590]" },
  { key: "COMPLETED", label: "Completed", dot: "bg-[#22C55E]" },
  { key: "GENERATING", label: "Generating", dot: "bg-blue-500" },
  { key: "PENDING", label: "Pending", dot: "bg-amber-500" },
  { key: "FAILED", label: "Failed", dot: "bg-red-500" },
];

const SORT_OPTIONS = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "risk-high", label: "Highest risk" },
  { key: "risk-low", label: "Lowest risk" },
  { key: "address-az", label: "Address (A–Z)" },
  { key: "address-za", label: "Address (Z–A)" },
];

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
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    if (!sortOpen) return;
    function handle(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [sortOpen]);

  const currentSort = SORT_OPTIONS.find((s) => s.key === sortKey) ?? SORT_OPTIONS[0];
  const hasQuery = searchQuery && searchQuery.length > 0;

  return (
    <div className="space-y-3">
      {/* Row 1: search + sort */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            strokeWidth={2}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6e7681] pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by address or title…"
            aria-label="Search reports"
            className="w-full h-10 pl-10 pr-10 rounded-xl text-sm bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] text-gray-900 dark:text-[#e6edf3] placeholder:text-gray-400 dark:placeholder:text-[#6e7681] hover:border-gray-300 dark:hover:border-[#3a424c] focus:outline-none focus:border-[#22C55E]/60 dark:focus:border-green-400/60 focus:ring-2 focus:ring-[#22C55E]/20 dark:focus:ring-green-400/20 transition-all duration-150"
          />
          {hasQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-[#e6edf3] hover:bg-gray-100 dark:hover:bg-[#1c2128] transition-all duration-150"
            >
              <X size={13} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative flex-shrink-0" ref={sortRef}>
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            aria-label={`Sort: ${currentSort.label}`}
            className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] text-sm text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2128] hover:border-gray-300 dark:hover:border-[#3a424c] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/50"
          >
            <span className="text-gray-500 dark:text-[#7d8590] text-[13px]">Sort:</span>
            <span className="font-medium">{currentSort.label}</span>
            <ChevronDown
              size={13}
              strokeWidth={2}
              className={`text-gray-500 dark:text-[#7d8590] transition-transform duration-150 ${sortOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: 0.12 }}
                role="listbox"
                className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] shadow-xl overflow-hidden"
              >
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = opt.key === sortKey;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSortChange(opt.key);
                        setSortOpen(false);
                      }}
                      className={[
                        "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm transition-colors duration-100",
                        isSelected
                          ? "bg-[#edf7f3] dark:bg-[#0d2818] text-[#16a34a] dark:text-green-400 font-medium"
                          : "text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#22282f]",
                      ].join(" ")}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <Check size={14} strokeWidth={2.5} className="text-[#16a34a] dark:text-green-400" />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Row 2: status chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_CHIPS.map((chip) => {
          const isActive = activeStatus === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onStatusChange(chip.key)}
              aria-pressed={isActive}
              className={[
                "flex items-center gap-1.5 h-8 px-3 rounded-full border text-[12px] font-medium transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/50",
                isActive
                  ? "bg-gray-900 dark:bg-[#e6edf3] text-white dark:text-[#0d1117] border-gray-900 dark:border-[#e6edf3] shadow-sm"
                  : "bg-white dark:bg-[#161b22] text-gray-700 dark:text-[#e6edf3] border-gray-200 dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#1c2128] hover:border-gray-300 dark:hover:border-[#3a424c]",
              ].join(" ")}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${chip.dot}`} />
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Row 3: result count */}
      <div className="text-[12px] text-gray-500 dark:text-[#7d8590]">
        {filteredCount === totalCount ? (
          <span>Showing all <span className="text-gray-800 dark:text-[#e6edf3] font-medium">{totalCount}</span> reports</span>
        ) : (
          <span>
            Showing <span className="text-gray-800 dark:text-[#e6edf3] font-medium">{filteredCount}</span> of{" "}
            <span className="text-gray-800 dark:text-[#e6edf3] font-medium">{totalCount}</span> reports
          </span>
        )}
      </div>
    </div>
  );
}