"use client";

import { useTranslation } from "react-i18next";
import { formatINR } from "@/utils/currency";
import SimilarityBadge from "./SimilarityBadge";
import BetterDealIndicator from "./BetterDealIndicator";

export default function ComparableTable({ comparables, subjectPricePerSqft }) {
  const { t } = useTranslation();

  if (!comparables || comparables.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#1c2128]">
              <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
                {t("report.comparable.table.address")}
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
                {t("report.comparable.table.similarity")}
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
                {t("report.comparable.table.distance")}
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
                {t("report.comparable.table.value")}
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
                {t("report.comparable.pricePerSqft")}
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
                {t("report.comparable.table.beds")}
              </th>
            </tr>
          </thead>
          <tbody>
            {comparables.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-100 dark:border-[#30363d] hover:bg-gray-50/50 dark:hover:bg-[#1c2128]/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-bold text-gray-900 dark:text-[#e6edf3] line-clamp-1">
                    {c.address}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[#7d8590]">{c.city}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <SimilarityBadge level={c.similarityLevel} score={c.similarityScore} />
                </td>
                <td className="px-4 py-3 text-center text-gray-600 dark:text-[#c9d1d9] tabular-nums">
                  {c.distanceKm != null ? `${c.distanceKm.toFixed(1)} km` : "—"}
                </td>
                <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-[#e6edf3]">
                  {c.marketValue != null ? formatINR(c.marketValue) : "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="tabular-nums text-gray-600 dark:text-[#c9d1d9]">
                      {c.pricePerSqft != null ? `₹${c.pricePerSqft.toLocaleString("en-IN")}` : "—"}
                    </span>
                    <BetterDealIndicator
                      comparablePricePerSqft={c.pricePerSqft}
                      subjectPricePerSqft={subjectPricePerSqft}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-gray-600 dark:text-[#c9d1d9] tabular-nums">
                  {c.bedrooms ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}