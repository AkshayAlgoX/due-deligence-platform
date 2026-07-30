"use client";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatINR } from "@/utils/currency";
import { translatePropertyType } from "@/utils/enumTranslations";

export default function ActiveFilterChips({ filters, removeFilter, clearAll }) {
  const { t } = useTranslation();
  const chips = [];

  // ── Property type chips (renamed loop var: t → typeVal to avoid shadowing t()) ──
  filters.types.forEach((typeVal) =>
    chips.push({
      key: `type-${typeVal}`,
      label: translatePropertyType(t, typeVal),
      color: "green",
      onRemove: () => removeFilter("types", typeVal),
    })
  );

  // ── City chips ──
  filters.cities.forEach((cityVal) =>
    chips.push({
      key: `city-${cityVal}`,
      label: cityVal,                 // city names stay as-is (proper nouns)
      color: "blue",
      onRemove: () => removeFilter("cities", cityVal),
    })
  );

  // ── Verified only chip ──
  if (filters.verifiedOnly) {
    chips.push({
      key: "verified",
      label: t("property.filter.verifiedOnly"),
      color: "green",
      onRemove: () => removeFilter("verifiedOnly"),
    });
  }

  // ── Min price chip ──
  if (filters.minPrice != null) {
    chips.push({
      key: "min-price",
      label: t("property.filter.chipMinPrice", {
        value: formatINR(filters.minPrice),
      }),
      color: "gray",
      onRemove: () => removeFilter("minPrice"),
    });
  }

  // ── Max price chip ──
  if (filters.maxPrice != null) {
    chips.push({
      key: "max-price",
      label: t("property.filter.chipMaxPrice", {
        value: formatINR(filters.maxPrice),
      }),
      color: "gray",
      onRemove: () => removeFilter("maxPrice"),
    });
  }

  // ── Sort chip ──
  if (filters.sortBy !== "recent") {
    const sortLabelMap = {
      "price-asc":  t("property.filter.sortOptions.priceAsc"),
      "price-desc": t("property.filter.sortOptions.priceDesc"),
      "alpha":      t("property.filter.sortOptions.alpha"),
    };
    chips.push({
      key: "sort",
      label: t("property.filter.chipSort", {
        label: sortLabelMap[filters.sortBy] ?? filters.sortBy,
      }),
      color: "purple",
      onRemove: () => removeFilter("sortBy"),
    });
  }

  if (chips.length === 0) return null;

  const colorClasses = {
    green:
      "bg-green-50 dark:bg-[#0d2818] text-green-700 dark:text-green-400 ring-green-200 dark:ring-green-900 hover:bg-green-100 dark:hover:bg-[#0d2818]/70",
    blue:
      "bg-blue-50 dark:bg-[#0c1f33] text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-900 hover:bg-blue-100 dark:hover:bg-[#0c1f33]/70",
    gray:
      "bg-gray-100 dark:bg-[#1c2128] text-gray-700 dark:text-[#e6edf3] ring-gray-200 dark:ring-[#30363d] hover:bg-gray-200 dark:hover:bg-[#30363d]",
    purple:
      "bg-purple-50 dark:bg-[#1f0e2e] text-purple-700 dark:text-purple-400 ring-purple-200 dark:ring-purple-900 hover:bg-purple-100 dark:hover:bg-[#1f0e2e]/70",
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* ── "Active:" label ── */}
      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 dark:text-[#6e7681] mr-1">
        {t("property.filter.activeLabel")}:
      </span>

      {/* ── Individual chips ── */}
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
            aria-label={t("property.filter.chipRemove", { label: chip.label })}
          >
            <X className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </span>
      ))}

      {/* ── Clear all ── */}
      <button
        onClick={clearAll}
        className="ml-1 text-[11px] font-bold text-gray-500 dark:text-[#7d8590] hover:text-red-600 dark:hover:text-red-400 transition"
      >
        {t("common.clearAll")}
      </button>
    </div>
  );
}