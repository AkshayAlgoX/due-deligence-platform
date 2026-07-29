"use client";

import { X } from "lucide-react";
import { formatINR } from "@/utils/currency";

export default function ActiveFilterChips({ filters, removeFilter, clearAll }) {
  const chips = [];

  filters.types.forEach((t) =>
    chips.push({ key: `type-${t}`, label: t, color: "green", onRemove: () => removeFilter("types", t) })
  );

  filters.cities.forEach((c) =>
    chips.push({ key: `city-${c}`, label: c, color: "blue", onRemove: () => removeFilter("cities", c) })
  );

  if (filters.verifiedOnly) {
    chips.push({
      key: "verified",
      label: "Verified only",
      color: "green",
      onRemove: () => removeFilter("verifiedOnly"),
    });
  }

  if (filters.minPrice != null) {
    chips.push({
      key: "min-price",
      label: `Min: ${formatINR(filters.minPrice)}`,
      color: "gray",
      onRemove: () => removeFilter("minPrice"),
    });
  }

  if (filters.maxPrice != null) {
    chips.push({
      key: "max-price",
      label: `Max: ${formatINR(filters.maxPrice)}`,
      color: "gray",
      onRemove: () => removeFilter("maxPrice"),
    });
  }

  if (filters.sortBy !== "recent") {
    const sortLabels = {
      "price-asc": "Price ↑",
      "price-desc": "Price ↓",
      "alpha": "A–Z",
    };
    chips.push({
      key: "sort",
      label: `Sort: ${sortLabels[filters.sortBy] || filters.sortBy}`,
      color: "purple",
      onRemove: () => removeFilter("sortBy"),
    });
  }

  if (chips.length === 0) return null;

  const colorClasses = {
    green:  "bg-green-50 dark:bg-[#0d2818] text-green-700 dark:text-green-400 ring-green-200 dark:ring-green-900 hover:bg-green-100 dark:hover:bg-[#0d2818]/70",
    blue:   "bg-blue-50 dark:bg-[#0c1f33] text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-900 hover:bg-blue-100 dark:hover:bg-[#0c1f33]/70",
    gray:   "bg-gray-100 dark:bg-[#1c2128] text-gray-700 dark:text-[#e6edf3] ring-gray-200 dark:ring-[#30363d] hover:bg-gray-200 dark:hover:bg-[#30363d]",
    purple: "bg-purple-50 dark:bg-[#1f0e2e] text-purple-700 dark:text-purple-400 ring-purple-200 dark:ring-purple-900 hover:bg-purple-100 dark:hover:bg-[#1f0e2e]/70",
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 dark:text-[#6e7681] mr-1">
        Active:
      </span>

      {chips.map((chip) => (
        <span
          key={chip.key}
          className={`
            inline-flex items-center gap-1.5
            rounded-full pl-3 pr-1 py-1
            text-xs font-semibold
            ring-1 transition
            ${colorClasses[chip.color]}
          `}
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="flex h-4 w-4 items-center justify-center rounded-full transition hover:bg-white/60 dark:hover:bg-black/30"
            aria-label={`Remove ${chip.label}`}
          >
            <X className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </span>
      ))}

      <button
        onClick={clearAll}
        className="ml-1 text-[11px] font-bold text-gray-500 dark:text-[#7d8590] hover:text-red-600 dark:hover:text-red-400 transition"
      >
        Clear all
      </button>
    </div>
  );
}