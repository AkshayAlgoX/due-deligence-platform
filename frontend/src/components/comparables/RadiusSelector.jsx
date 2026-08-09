"use client";

import { useTranslation } from "react-i18next";
import { RADIUS_OPTIONS } from "@/utils/geoUtils";

export default function RadiusSelector({ value, onChange, disabled = false }) {
  const { t } = useTranslation();

  return (
    <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#1c2128] p-1">
      {RADIUS_OPTIONS.map((km) => {
        const active = value === km;
        return (
          <button
            key={km}
            type="button"
            disabled={disabled}
            onClick={() => onChange(km)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              active
                ? "bg-white dark:bg-[#0d1117] text-[#16a34a] dark:text-green-400 shadow-sm"
                : "text-gray-500 dark:text-[#7d8590] hover:text-gray-800 dark:hover:text-[#e6edf3]"
            }`}
          >
            {t("report.comparable.radiusKm", { km })}
          </button>
        );
      })}
    </div>
  );
}