"use client";

import { useTranslation } from "react-i18next";
import { Ruler } from "lucide-react";

export default function PricePerSqftChart({ trends = [] }) {
  const { t } = useTranslation();

  if (!trends || trends.length === 0) return null;

  const maxVal = Math.max(...trends.map((t) => t.avgPricePerSqft ?? 0), 1);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Ruler className="h-4 w-4 text-[#16a34a] dark:text-green-400" strokeWidth={2.2} />
        <h3 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
          {t("report.valuation.perSqft")}
        </h3>
      </div>

      <div className="flex items-end gap-2 h-32">
        {trends.map((point, i) => {
          const heightPct = Math.max(((point.avgPricePerSqft ?? 0) / maxVal) * 100, 4);
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
              <span className="text-[9px] font-bold tabular-nums text-gray-500 dark:text-[#7d8590]">
                ₹{Math.round(point.avgPricePerSqft ?? 0).toLocaleString("en-IN")}
              </span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[#16a34a] to-[#22C55E] transition-all duration-500"
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[9px] font-semibold text-gray-400 dark:text-[#6e7681]">
                {point.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}