"use client";

import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";

export default function PriceTrendGraph({ trends = [] }) {
  const { t } = useTranslation();

  if (!trends || trends.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3] mb-1">
          {t("report.valuation.priceTrend")}
        </h3>
        <p className="text-xs text-gray-400 dark:text-[#6e7681] mt-4 text-center py-8">
          {t("report.comparable.noResults")}
        </p>
      </div>
    );
  }

  const width = 600;
  const height = 180;
  const padding = 24;

  const values = trends.map((t) => t.avgPricePerSqft ?? 0);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  const points = trends.map((point, i) => {
    const x = padding + (i / Math.max(trends.length - 1, 1)) * (width - padding * 2);
    const y =
      height - padding - ((point.avgPricePerSqft - minVal) / range) * (height - padding * 2);
    return { x, y, ...point };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height - padding} L ${points[0].x.toFixed(
    1
  )} ${height - padding} Z`;

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-[#16a34a] dark:text-green-400" strokeWidth={2.2} />
        <h3 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
          {t("report.valuation.priceTrend")}
        </h3>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#trendFill)" />
        <path d={pathD} fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#16a34a" />
        ))}
      </svg>

      <div className="mt-2 flex justify-between text-[10px] font-semibold text-gray-400 dark:text-[#6e7681]">
        <span>{trends[0]?.month}</span>
        <span>{trends[trends.length - 1]?.month}</span>
      </div>
    </div>
  );
}