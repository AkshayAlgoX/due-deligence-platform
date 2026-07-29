"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trendValue,
  trendUp,
  href,
}) {
  const hasTrend =
    trendValue !== null &&
    trendValue !== undefined &&
    trendValue !== "0" &&
    trendValue !== "0%";

  const cardInner = (
    <div
      className={`group flex h-full flex-col justify-between gap-6 rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-sm transition-all duration-200 ${
        href
          ? "hover:border-[#22C55E] hover:shadow-[0_8px_24px_rgba(34,197,94,0.12)] hover:-translate-y-0.5 cursor-pointer"
          : "hover:border-gray-200 dark:hover:border-[#484f58]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-[#0d2818] text-[#22C55E] dark:text-green-400 transition-transform duration-200 group-hover:scale-110">
          {icon}
        </div>

        <div className="flex items-center gap-2">
          {hasTrend && (
            <div
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                trendUp
                  ? "bg-green-100 dark:bg-[#0d2818] text-green-700 dark:text-green-400"
                  : "bg-red-100 dark:bg-[#2d1214] text-red-700 dark:text-red-400"
              }`}
            >
              {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>
                {trendValue.startsWith("-")
                  ? trendValue.substring(1)
                  : trendValue}
              </span>
            </div>
          )}

          {href && (
            <ArrowUpRight
              size={16}
              strokeWidth={2.5}
              className="text-gray-300 dark:text-[#6e7681] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-[#22C55E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          )}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500 dark:text-[#7d8590]">{title}</p>
        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-[#e6edf3]">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 dark:text-[#6e7681]">{subtitle}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {cardInner}
      </Link>
    );
  }

  return cardInner;
}