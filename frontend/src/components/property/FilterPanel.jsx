"use client";

import { useEffect, useMemo } from "react";
// Replace the existing import block with:
import {
  X,
  ListFilter,
  Check,
  BadgeCheck,
  ArrowUpDown,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { formatINR } from "@/utils/currency";

const SORT_OPTIONS = [
  { value: "recent",     label: "Recently Added" },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "alpha",      label: "Alphabetical (A–Z)" },
  { value: "risk-desc",  label: "Highest risk first" },
];

export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  setFilter,
  toggleArrayFilter,
  clearAll,
  properties = [],
  filteredCount = 0,
}) {
  const availableTypes = useMemo(
    () => [...new Set(properties.map((p) => p.propertyType).filter(Boolean))].sort(),
    [properties]
  );

  const availableCities = useMemo(
    () => [...new Set(properties.map((p) => p.city).filter(Boolean))].sort(),
    [properties]
  );

  const maxPriceInData = useMemo(
    () => Math.max(...properties.map((p) => p.marketValue || 0), 10000000),
    [properties]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Replace the existing activeFilterCount declaration:
const activeFilterCount =
  filters.types.length +
  filters.cities.length +
  (filters.verifiedOnly ? 1 : 0) +
  (filters.pendingOnly  ? 1 : 0) +
  (filters.highRisk     ? 1 : 0) +
  (filters.minPrice != null ? 1 : 0) +
  (filters.maxPrice != null ? 1 : 0) +
  (filters.sortBy !== "recent" ? 1 : 0);
  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="
        absolute right-0 top-0 bottom-0
        w-full max-w-md
        bg-white
        shadow-[-20px_0_60px_rgba(0,0,0,0.15)]
        flex flex-col
        animate-in slide-in-from-right duration-300
      ">
        {/* ── HEADER — REFINED ─────────────────────────────────────── */}
        <div className="
          relative flex items-center justify-between
          border-b border-gray-100
          px-6 py-5
          bg-white
        ">
          {/* Subtle green accent bar on the left */}
          <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b from-[#22C55E] to-[#16a34a]" />

          <div className="flex items-center gap-3 pl-2">
            {/* Refined icon — glass morphism, not solid heavy square */}
            <div className="
              flex h-11 w-11 items-center justify-center
              rounded-2xl
              bg-gradient-to-br from-green-50 to-emerald-50
              ring-1 ring-green-100
              relative
            ">
              <ListFilter className="h-5 w-5 text-[#16a34a]" strokeWidth={2.2} />

              {/* Small active-count dot indicator */}
              {activeFilterCount > 0 && (
                <span className="
                  absolute -top-1 -right-1
                  flex h-4 min-w-4 items-center justify-center
                  rounded-full
                  bg-[#22C55E]
                  px-1
                  text-[9px] font-black text-white
                  ring-2 ring-white
                ">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight leading-tight">
                Filters
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {activeFilterCount > 0
                  ? `${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} active`
                  : "Refine your property list"
                }
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter body — UNCHANGED */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          <FilterSection title="Property Type">
            <div className="flex flex-wrap gap-2">
              {availableTypes.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No types in data yet</p>
              ) : (
                availableTypes.map((type) => {
                  const active = filters.types.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleArrayFilter("types", type)}
                      className={`
                        flex items-center gap-1.5 rounded-full px-3 py-1.5
                        text-xs font-bold transition
                        ${active
                          ? "bg-[#22C55E] text-white shadow-md shadow-green-500/30"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }
                      `}
                    >
                      {active && <Check className="h-3 w-3" strokeWidth={3} />}
                      {type}
                    </button>
                  );
                })
              )}
            </div>
          </FilterSection>

          <FilterSection title="City">
            <div className="flex flex-wrap gap-2">
              {availableCities.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No cities in data yet</p>
              ) : (
                availableCities.map((city) => {
                  const active = filters.cities.includes(city);
                  return (
                    <button
                      key={city}
                      onClick={() => toggleArrayFilter("cities", city)}
                      className={`
                        rounded-full px-3 py-1.5
                        text-xs font-bold transition
                        ${active
                          ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }
                      `}
                    >
                      {active && "✓ "}{city}
                    </button>
                  );
                })
              )}
            </div>
          </FilterSection>

          <FilterSection title="Price Range">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1 block">
                    Min (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice ?? ""}
                    onChange={(e) =>
                      setFilter("minPrice", e.target.value ? +e.target.value : null)
                    }
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1 block">
                    Max (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={filters.maxPrice ?? ""}
                    onChange={(e) =>
                      setFilter("maxPrice", e.target.value ? +e.target.value : null)
                    }
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400">
                Highest in database: {formatINR(maxPriceInData)}
              </p>
            </div>
          </FilterSection>

          <FilterSection title="Data quality">
  {/* Verified only toggle */}
  <label className="flex items-center justify-between cursor-pointer group gap-3">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-[#22C55E]">
        <BadgeCheck className="h-4 w-4" strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900">Verified only</p>
        <p className="text-[11px] text-gray-500">
          Show properties that passed all quality checks
        </p>
      </div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={filters.verifiedOnly}
      onClick={() => setFilter("verifiedOnly", !filters.verifiedOnly)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2 ${
        filters.verifiedOnly ? "bg-[#22C55E]" : "bg-gray-200"
      }`}
    >
      <span className="sr-only">Toggle verified-only filter</span>
      <span
        aria-hidden="true"
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          filters.verifiedOnly ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  </label>

  {/* Divider */}
  <div className="my-3 h-px bg-gray-100" />

  {/* High risk toggle */}
  <label className="flex items-center justify-between cursor-pointer group gap-3">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
        <ShieldAlert className="h-4 w-4" strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900">High risk only</p>
        <p className="text-[11px] text-gray-500">
          Show properties with risk score above 66
        </p>
      </div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={filters.highRisk}
      onClick={() => setFilter("highRisk", !filters.highRisk)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 ${
        filters.highRisk ? "bg-red-500" : "bg-gray-200"
      }`}
    >
      <span className="sr-only">Toggle high-risk filter</span>
      <span
        aria-hidden="true"
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          filters.highRisk ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  </label>
</FilterSection>
          <FilterSection title="Sort By">
            <div className="space-y-2">
              {SORT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`
                    flex items-center justify-between cursor-pointer
                    rounded-xl px-3 py-2.5 transition
                    ${filters.sortBy === opt.value
                      ? "bg-green-50 ring-1 ring-green-200"
                      : "hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <ArrowUpDown
                      className={`h-3.5 w-3.5 ${
                        filters.sortBy === opt.value ? "text-[#22C55E]" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        filters.sortBy === opt.value
                          ? "font-bold text-gray-900"
                          : "font-medium text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="sortBy"
                    value={opt.value}
                    checked={filters.sortBy === opt.value}
                    onChange={() => setFilter("sortBy", opt.value)}
                    className="h-4 w-4 accent-[#22C55E]"
                  />
                </label>
              ))}
            </div>
          </FilterSection>
        </div>

        {/* ── FOOTER — REFINED ─────────────────────────────────────── */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">

          {/* Small stats line — muted, contextual */}
          <div className="mb-3 flex items-center justify-between text-[11px]">
            <span className="text-gray-500">
              Matching{" "}
              <span className="font-black text-gray-900 text-sm tabular-nums">
                {filteredCount}
              </span>
              <span className="text-gray-400 tabular-nums"> / {properties.length}</span>
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="
                  text-[11px] font-bold text-gray-500
                  hover:text-red-600 transition-colors
                  underline-offset-2 hover:underline
                "
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Action row — Clear (ghost) + View Results (primary) */}
          <div className="flex items-stretch gap-2">
            <button
              onClick={clearAll}
              disabled={activeFilterCount === 0}
              className="
                flex-shrink-0
                rounded-xl border border-gray-200 bg-white
                px-4 py-3
                text-sm font-semibold text-gray-700
                transition
                hover:bg-gray-50 hover:border-gray-300
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white
              "
            >
              Clear
            </button>

            {/* Primary action — count-based CTA (Airbnb pattern) */}
            <button
              onClick={onClose}
              disabled={filteredCount === 0}
              className="
                group relative flex-1
                flex items-center justify-center gap-2
                overflow-hidden
                rounded-xl
                bg-gray-900
                px-5 py-3
                text-sm font-bold text-white
                transition-all
                hover:bg-gray-800
                active:scale-[0.98]
                disabled:bg-gray-300 disabled:cursor-not-allowed
              "
            >
              {/* Subtle shimmer on hover */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              <span className="relative z-10">
                {filteredCount === 0
                  ? "No matches"
                  : `View ${filteredCount} ${filteredCount === 1 ? "Property" : "Properties"}`
                }
              </span>

              {filteredCount > 0 && (
                <ArrowRight
                  className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable section wrapper — UNCHANGED
function FilterSection({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2.5">
        {title}
      </p>
      {children}
    </div>
  );
}