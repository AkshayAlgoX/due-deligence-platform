"use client";

import { Radio, Database, AlertCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DataSourceBadge({ status, dataSource, retrievedAt }) {
  const { t } = useTranslation();
  const config = getConfig(status, t);
  const Icon = config.icon;

  const timeAgo = retrievedAt ? formatTimeAgo(retrievedAt, t) : null;

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${config.className}`}
        title={dataSource}
      >
        <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
        {config.label}
      </div>
      {timeAgo && (
        <span className="text-[10px] text-gray-400 dark:text-[#6e7681]">{timeAgo}</span>
      )}
    </div>
  );
}

function getConfig(status, t) {
  switch (status) {
    case "LIVE":
      return {
        label: t("property.comparison.status.live"),
        icon: Radio,
        className:
          "text-green-700 dark:text-green-400 bg-green-50 dark:bg-[#0d2818] ring-green-200 dark:ring-green-900",
      };
    case "CACHED":
      return {
        label: t("property.comparison.status.cached"),
        icon: Radio,
        className:
          "text-green-700 dark:text-green-400 bg-green-50 dark:bg-[#0d2818] ring-green-200 dark:ring-green-900",
      };
    case "MOCK":
      return {
        label: t("property.aggregation.badge.mock"),
        icon: Database,
        className:
          "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-[#282a10] ring-amber-200 dark:ring-amber-900",
      };
    case "NO_DATA":
      return {
        label: t("property.comparison.status.noData"),
        icon: Database,
        className:
          "text-gray-600 dark:text-[#7d8590] bg-gray-50 dark:bg-[#1c2128] ring-gray-200 dark:ring-[#30363d]",
      };
    case "TIMEOUT":
      return {
        label: t("property.comparison.status.timedOut"),
        icon: Clock,
        className:
          "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-[#282a10] ring-orange-200 dark:ring-orange-900",
      };
    default:
      return {
        label: t("property.comparison.status.unavailable"),
        icon: AlertCircle,
        className:
          "text-red-700 dark:text-red-400 bg-red-50 dark:bg-[#2d1214] ring-red-200 dark:ring-red-900",
      };
  }
}

function formatTimeAgo(iso, t) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return t("common.justNow");
  if (secs < 3600) return t("common.minutesAgo", { n: Math.floor(secs / 60) });
  if (secs < 86400) return t("common.hoursAgo", { n: Math.floor(secs / 3600) });
  return t("common.daysAgo", { n: Math.floor(secs / 86400) });
}