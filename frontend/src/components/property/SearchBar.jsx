"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Search,
  X,
  ArrowRight,
  Loader2,
  Building2,
  CornerDownLeft,
} from "lucide-react";
import { formatINR } from "@/utils/currency";

/**
 * SearchBar — debounced search with live suggestions dropdown.
 *
 * UX rules:
 *  - Debounce = 600ms (feels natural, avoids accidental fires)
 *  - Suggestions dropdown appears BELOW input while typing (not toast)
 *  - Toast is suppressed during debounced auto-search (parent handles)
 *  - Enter or Search button → explicit search + closes dropdown
 *  - Arrow keys navigate suggestions, Enter selects highlighted one
 *  - Click outside closes dropdown
 */
export default function SearchBar({
  onSearch,
  onSelectSuggestion,  // Optional: called when user picks from dropdown
  suggestions = [],    // Array of property objects to show as live results
  initialValue = "",
  isSearching = false,
}) {
  const [query, setQuery] = useState(initialValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const debounceTimer = useRef(null);
  const lastFiredRef = useRef(initialValue);
  const containerRef = useRef(null);

  // Sync when parent updates initialValue (URL param loaded async)
  useEffect(() => {
    setQuery(initialValue);
    lastFiredRef.current = initialValue;
  }, [initialValue]);

  // Debounced fire — 600ms after user stops typing
  const debouncedSearch = useCallback(
    (value) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        if (value !== lastFiredRef.current) {
          lastFiredRef.current = value;
          onSearch?.(value, { silent: true }); // silent = no toast
        }
      }, 600);
    },
    [onSearch]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Click outside → close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        setHighlightIdx(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setHighlightIdx(-1);

    // Show dropdown as soon as user starts typing (min 1 char)
    if (val.trim().length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }

    debouncedSearch(val);
  };

  // Explicit submit (Enter or button) — immediate, with toast
  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // If user has highlighted a suggestion, pick that instead
    if (highlightIdx >= 0 && suggestions[highlightIdx]) {
      handlePickSuggestion(suggestions[highlightIdx]);
      return;
    }

    lastFiredRef.current = query;
    setShowDropdown(false);
    onSearch?.(query, { silent: false }); // explicit = show toast
  };

  const handleClear = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setQuery("");
    lastFiredRef.current = "";
    setShowDropdown(false);
    setHighlightIdx(-1);
    onSearch?.("", { silent: true });
  };

  const handlePickSuggestion = (property) => {
    setQuery(property.address || "");
    lastFiredRef.current = property.address || "";
    setShowDropdown(false);
    setHighlightIdx(-1);
    onSelectSuggestion?.(property);
  };

  // Keyboard navigation in dropdown
  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightIdx(-1);
    }
  };

  // Show only top 5 suggestions in dropdown
  const topSuggestions = suggestions.slice(0, 5);
  const hasMoreResults = suggestions.length > 5;

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">

        {/* Input */}
        <div className="relative flex-1 group">
          {/* Left icon: spinner when searching, pin when idle */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            {isSearching ? (
              <Loader2 className="h-4 w-4 text-[#22C55E] animate-spin" />
            ) : (
              <MapPin className="h-4 w-4 text-gray-400 group-focus-within:text-[#22C55E] transition-colors" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim().length > 0 && setShowDropdown(true)}
            placeholder="Search by address, city, ZIP code..."
            aria-label="Property search"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            className="
              h-14 w-full
              rounded-2xl
              border-2 border-gray-100
              bg-gray-50/50
              pl-11 pr-11
              text-sm font-medium
              outline-none
              transition-all
              focus:border-[#22C55E]
              focus:bg-white
              focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)]
              placeholder:text-gray-400
            "
          />

          {/* Clear button */}
          {query && !isSearching && (
            <button
              type="button"
              onClick={handleClear}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                rounded-full p-1.5
                text-gray-400
                transition hover:bg-gray-100 hover:text-gray-600
                z-10
              "
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search button */}
        <button
          type="submit"
          disabled={isSearching}
          className="
            group relative
            flex items-center justify-center gap-2
            overflow-hidden
            rounded-2xl
            bg-gradient-to-br from-[#22C55E] to-[#16a34a]
            px-8 py-3.5
            text-sm font-bold text-white
            shadow-[0_10px_30px_rgba(34,197,94,0.35)]
            transition-all
            hover:shadow-[0_15px_40px_rgba(34,197,94,0.5)]
            hover:scale-[1.02]
            active:scale-[0.98]
            disabled:opacity-70
            disabled:cursor-not-allowed
            disabled:hover:scale-100
          "
        >
          {!isSearching && (
            <span className="
              absolute inset-0 -translate-x-full
              bg-gradient-to-r from-transparent via-white/20 to-transparent
              transition-transform duration-1000
              group-hover:translate-x-full
            " />
          )}

          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin relative z-10" />
              <span className="relative z-10">Searching...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4 relative z-10" strokeWidth={2.5} />
              <span className="relative z-10">Search</span>
              <ArrowRight
                className="h-4 w-4 relative z-10 transition-transform group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </>
          )}
        </button>
      </form>

      {/* ── LIVE SUGGESTIONS DROPDOWN — appears BELOW input ─────────────────── */}
      {showDropdown && (
        <div className="
          absolute left-0 right-0 top-[calc(100%+8px)]
          z-50
          overflow-hidden
          rounded-2xl
          border border-gray-100
          bg-white
          shadow-[0_20px_60px_rgba(0,0,0,0.12)]
          animate-in fade-in slide-in-from-top-2 duration-150
        ">
          {/* Header — searching state */}
          {isSearching && (
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
              <Loader2 className="h-3.5 w-3.5 text-[#22C55E] animate-spin" />
              <p className="text-xs font-medium text-gray-500">
                Searching for &ldquo;<span className="text-gray-700">{query}</span>&rdquo;...
              </p>
            </div>
          )}

          {/* Empty state — no results while typing */}
          {!isSearching && topSuggestions.length === 0 && query.trim().length > 0 && (
            <div className="px-4 py-6 text-center">
              <Building2 className="mx-auto h-8 w-8 text-gray-200" />
              <p className="mt-2 text-sm font-semibold text-gray-600">
                No matches for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                Try a different city, address, or ZIP
              </p>
            </div>
          )}

          {/* Suggestion list */}
          {!isSearching && topSuggestions.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                  {suggestions.length} {suggestions.length === 1 ? "Match" : "Matches"}
                </p>
              </div>

              <ul className="max-h-[320px] overflow-y-auto">
                {topSuggestions.map((property, idx) => {
                  const isHighlighted = idx === highlightIdx;
                  return (
                    <li key={property.id}>
                      <button
                        type="button"
                        onClick={() => handlePickSuggestion(property)}
                        onMouseEnter={() => setHighlightIdx(idx)}
                        className={`
                          w-full flex items-center gap-3
                          px-4 py-3
                          text-left
                          transition-colors
                          border-b border-gray-50 last:border-b-0
                          ${isHighlighted
                            ? "bg-green-50"
                            : "hover:bg-gray-50/70"
                          }
                        `}
                      >
                        {/* Icon */}
                        <div className={`
                          flex-shrink-0 flex h-10 w-10 items-center justify-center
                          rounded-xl
                          transition-colors
                          ${isHighlighted
                            ? "bg-[#22C55E] text-white"
                            : "bg-gray-100 text-gray-500"
                          }
                        `}>
                          <Building2 className="h-4 w-4" strokeWidth={2.5} />
                        </div>

                        {/* Address + city */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {property.address || "Untitled property"}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {[property.city, property.state, property.zipCode]
                              .filter(Boolean)
                              .join(", ") || "Location unknown"}
                          </p>
                        </div>

                        {/* Market value pill */}
                        {property.marketValue > 0 && (
                          <div className="flex-shrink-0 text-right">
                            <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                              Value
                            </p>
                            <p className="text-sm font-bold text-[#16a34a]">
                              {formatINR(property.marketValue)}
                            </p>
                          </div>
                        )}

                        {/* Enter hint — only on highlighted */}
                        {isHighlighted && (
                          <CornerDownLeft className="h-3.5 w-3.5 text-[#22C55E] flex-shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Footer — "see all" if there are more results */}
              {hasMoreResults && (
                <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-xs font-semibold text-[#22C55E] hover:text-[#16a34a] transition-colors flex items-center gap-1"
                  >
                    See all {suggestions.length} results
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Keyboard hint footer */}
              <div className="border-t border-gray-100 bg-white px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 font-mono text-[9px]">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 font-mono text-[9px]">↵</kbd>
                    Select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 font-mono text-[9px]">esc</kbd>
                    Close
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}