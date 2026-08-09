"use client";

import { useTranslation } from "react-i18next";
import { TrendingUp, RefreshCw, Loader2, Info } from "lucide-react";
import { formatINR, formatINRFull } from "@/utils/currency";

export default function ValuationSummary({ valuation, hasValuation, calculating, onCalculate }) {
  const { t } = useTranslation();

  if (!hasValuation) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 shadow-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818] mb-4">
          <TrendingUp className="h-5 w-5 text-[#16a34a] dark:text-green-400" strokeWidth={2.2} />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
          {t("report.valuation.noValuationYet")}
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590] max-w-sm mx-auto">
          {t("report.valuation.noValuationDesc")}
        </p>
        <button
          type="button"
          onClick={onCalculate}
          disabled={calculating}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] transition-all hover:scale-[1.02] disabled:opacity-70"
        >
          {calculating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TrendingUp className="h-4 w-4" strokeWidth={2.4} />
          )}
          {calculating ? t("report.valuation.calculating") : t("report.valuation.calculateNow")}
        </button>
      </div>
    );
  }

  const { estimatedValue, confidenceLow, confidenceHigh, calculatedAt } = valuation ?? {};

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 shadow-sm">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#22C55E] dark:text-green-400">
            {t("report.valuation.estimatedValue")}
          </p>
          <p className="mt-1 text-[36px] font-black leading-none tracking-tight text-gray-900 dark:text-[#e6edf3]">
            {estimatedValue != null ? formatINRFull(estimatedValue) : "—"}
          </p>

          {confidenceLow != null && confidenceHigh != null && (
            <p className="mt-2 text-sm text-gray-500 dark:text-[#7d8590]">
              {t("report.valuation.confidenceRange")}:{" "}
              <span className="font-semibold text-gray-700 dark:text-[#c9d1d9]">
                {formatINR(confidenceLow)} – {formatINR(confidenceHigh)}
              </span>
            </p>
          )}

          {calculatedAt && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400 dark:text-[#6e7681]">
              <Info className="h-3 w-3" strokeWidth={2} />
              {t("report.valuation.calculatedOn", {
                date: new Date(calculatedAt).toLocaleDateString(),
              })}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onCalculate}
          disabled={calculating}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-[#e6edf3] transition-all hover:border-[#22C55E] hover:text-[#16a34a] dark:hover:text-green-400 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${calculating ? "animate-spin" : ""}`}
            strokeWidth={2.4}
          />
          {calculating ? t("report.valuation.recalculating") : t("report.valuation.recalculate")}
        </button>
      </div>
    </div>
  );
}