// src/components/ui/SearchableSelect.jsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, Plus } from "lucide-react";

/**
 * Searchable dropdown with keyboard navigation + optional custom entry.
 *
 * Props:
 *   value            - current selected value (string)
 *   onChange(value)  - fires with new value (string)
 *   options          - array of strings, OR array of { value, label } objects
 *   placeholder      - placeholder text when empty
 *   disabled         - disable interaction
 *   error            - boolean, applies red border
 *   allowCustom      - if true, shows "Use 'xyz' as custom" option when no match
 *   icon             - Lucide icon component to show on the left of the trigger
 *   maxHeight        - max height of dropdown menu (default 240px)
 */
export default function SearchableSelect({
  value = "",
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  error = false,
  allowCustom = false,
  icon: Icon,
  maxHeight = 240,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Normalize options: support both string[] and {value, label}[]
  const normalizedOptions = useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt
    );
  }, [options]);

  // Filter by query (case-insensitive contains)
  const filtered = useMemo(() => {
    if (!query.trim()) return normalizedOptions;
    const q = query.trim().toLowerCase();
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(q)
    );
  }, [normalizedOptions, query]);

  // Should we show custom-entry option?
  const trimmedQuery = query.trim();
  const showCustomOption =
    allowCustom &&
    trimmedQuery.length > 0 &&
    !normalizedOptions.some(
      (opt) => opt.label.toLowerCase() === trimmedQuery.toLowerCase()
    );

  // Total selectable rows (filtered + optional custom option)
  const totalRows = filtered.length + (showCustomOption ? 1 : 0);

  // ── Reset active index when list changes ──────────────────────────
  useEffect(() => {
    setActiveIdx(0);
  }, [query, open]);

  // ── Focus search input when opened ────────────────────────────────
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  // ── Click outside closes ──────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Scroll active row into view ───────────────────────────────────
  useEffect(() => {
    if (!open || !listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-idx="${activeIdx}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx, open]);

  const commitSelection = (val) => {
    onChange?.(val);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((idx) => (idx + 1) % Math.max(totalRows, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((idx) => (idx - 1 + totalRows) % Math.max(totalRows, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx < filtered.length) {
        commitSelection(filtered[activeIdx].value);
      } else if (showCustomOption) {
        commitSelection(trimmedQuery);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* ── Trigger ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        className={`
          h-11 w-full rounded-xl border bg-white pr-3 text-left text-sm
          outline-none transition flex items-center justify-between gap-2
          ${Icon ? "pl-10" : "pl-3"}
          ${open
            ? "border-[#22C55E] ring-2 ring-green-100"
            : error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-gray-200 hover:border-gray-300"
          }
          disabled:bg-gray-50 disabled:cursor-not-allowed
        `}
      >
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        )}

        <span className={`truncate ${value ? "text-gray-800" : "text-gray-400"}`}>
          {value || placeholder}
        </span>

        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── Dropdown ───────────────────────────────────────────── */}
      {open && (
        <div className="
          absolute z-30 top-full mt-2 left-0 right-0
          rounded-xl border border-gray-100 bg-white
          shadow-[0_20px_50px_rgba(0,0,0,0.15)]
          overflow-hidden
          animate-in fade-in slide-in-from-top-2 duration-150
        ">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
            <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type to search..."
              className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Options list */}
          <div
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {filtered.length === 0 && !showCustomOption && (
              <div className="px-3 py-6 text-center text-xs text-gray-500">
                No matches for "{trimmedQuery}"
              </div>
            )}

            {filtered.map((opt, idx) => {
              const isActive = idx === activeIdx;
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  data-idx={idx}
                  onClick={() => commitSelection(opt.value)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`
                    w-full flex items-center justify-between gap-3 px-3 py-2
                    text-left text-sm transition-colors
                    ${isActive ? "bg-green-50" : "hover:bg-gray-50"}
                  `}
                >
                  <span className={`truncate ${
                    isSelected ? "font-bold text-[#16a34a]" : "text-gray-800"
                  }`}>
                    {opt.label}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 flex-shrink-0 text-[#22C55E]" strokeWidth={3} />
                  )}
                </button>
              );
            })}

            {/* Custom-entry fallback */}
            {showCustomOption && (
              <button
                type="button"
                data-idx={filtered.length}
                onClick={() => commitSelection(trimmedQuery)}
                onMouseEnter={() => setActiveIdx(filtered.length)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2.5
                  text-left text-sm transition-colors border-t border-gray-100
                  ${activeIdx === filtered.length ? "bg-green-50" : "hover:bg-gray-50"}
                `}
              >
                <Plus className="h-4 w-4 flex-shrink-0 text-gray-500" strokeWidth={2.2} />
                <span className="text-gray-700">
                  Use <span className="font-bold text-gray-900">"{trimmedQuery}"</span>
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}