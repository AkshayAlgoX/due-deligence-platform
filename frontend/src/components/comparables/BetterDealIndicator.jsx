"use client";

import { useTranslation } from "react-i18next";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function BetterDealIndicator({ comparablePricePerSqft, subjectPricePerSqft }) {
  const { t } = useTranslation();

  if (comparablePricePerSqft == null || subjectPricePerSqft == null || subjectPricePerSqft === 0) {
    return null;
  }

  const diffPct = ((comparablePricePerSqft - subjectPricePerSqft) / subjectPricePerSqft) * 100;
  const isBetterDeal = diffPct <= -5;
  const isPricier = diffPct >= 5;

  if (!isBetterDeal && !isPricier) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
        isBetterDeal
          ? "bg-green-50 dark:bg-[#0d2818] text-green-700 dark:text-green-400"
          : "bg-amber-50 dark:bg-[#282a10] text-amber-700 dark:text-amber-400"
      }`}
    >
      {isBetterDeal ? (
        <TrendingDown className="h-2.5 w-2.5" strokeWidth={2.5} />
      ) : (
        <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.5} />
      )}
      {isBetterDeal
        ? t("report.comparable.betterDealBy", { pct: Math.abs(Math.round(diffPct)) })
        : t("report.comparable.pricierBy", { pct: Math.round(diffPct) })}
    </span>
  );
}