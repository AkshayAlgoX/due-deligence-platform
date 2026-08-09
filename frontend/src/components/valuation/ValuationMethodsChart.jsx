"use client";

import { useTranslation } from "react-i18next";
import { formatINR } from "@/utils/currency";

export default function ValuationMethodsChart({ breakdown }) {
  const { t } = useTranslation();

  if (!breakdown) return null;

  const bars = [
    {
      key: "comparable",
      label: t("report.valuation.methods.comparable"),
      value: breakdown.comparableMethodValue,
      color: "#22C55E",
    },
    {
      key: "cost",
      label: t("report.valuation.methods.cost"),
      value: breakdown.costMethodValue,
      color: "#3b82f6",
    },
    {
      key: "income",
      label: t("report.valuation.methods.income"),
      value: breakdown.incomeMethodValue,
      color: "#a855f7",
    },
    {
      key: "final",
      label: t("report.valuation.methods.final"),
      value: breakdown.finalEstimatedValue,
      color: "#16a34a",
    },
  ].filter((b) => b.value != null);

  const maxValue = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
        {t("report.valuation.methodsComparisonTitle")}
      </h3>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-[#7d8590] mb-6">
        {t("report.valuation.methodsComparisonDesc")}
      </p>

      <div className="space-y-4">
        {bars.map((bar) => {
          const widthPct = Math.max((bar.value / maxValue) * 100, 2);
          return (
            <div key={bar.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-600 dark:text-[#c9d1d9]">
                  {bar.label}
                </span>
                <span className="text-xs font-bold tabular-nums text-gray-900 dark:text-[#e6edf3]">
                  {formatINR(bar.value)}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-[#1c2128] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${widthPct}%`, backgroundColor: bar.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}