"use client";

import { X } from "lucide-react";
import { formatINR } from "@/utils/currency";

/**
 * ActiveFilterChips — horizontal row of removable filter chips.
 * Shows above the results grid when filters are active.
 */
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
    green: "bg-green-50 text-green-700 ring-green-200 hover:bg-green-100",
    blue:  "bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100",
    gray:  "bg-gray-100 text-gray-700 ring-gray-200 hover:bg-gray-200",
    purple:"bg-purple-50 text-purple-700 ring-purple-200 hover:bg-purple-100",
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mr-1">
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
            className="flex h-4 w-4 items-center justify-center rounded-full transition hover:bg-white/60"
            aria-label={`Remove ${chip.label}`}
          >
            <X className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </span>
      ))}

      <button
        onClick={clearAll}
        className="ml-1 text-[11px] font-bold text-gray-500 hover:text-red-600 transition"
      >
        Clear all
      </button>
    </div>
  );
}