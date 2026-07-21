"use client";

import { Radio, Database, AlertCircle, Clock } from "lucide-react";

/**
 * Small pill showing where data came from.
 *
 * LIVE / CACHED → green "Live" (real integration)
 * MOCK          → amber "Mock" (real API unavailable for region)
 * NO_DATA       → gray "No data"
 * UNAVAILABLE / TIMEOUT / ERROR → red "Unavailable"
 */
export default function DataSourceBadge({ status, dataSource, retrievedAt }) {
  const config = getConfig(status);
  const Icon = config.icon;

  const timeAgo = retrievedAt ? formatTimeAgo(retrievedAt) : null;

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
        <span className="text-[10px] text-gray-400">{timeAgo}</span>
      )}
    </div>
  );
}

function getConfig(status) {
  switch (status) {
    case "LIVE":
    case "CACHED":
      return {
        label: status === "CACHED" ? "Cached" : "Live",
        icon: Radio,
        className: "text-green-700 bg-green-50 ring-green-200",
      };
    case "MOCK":
      return {
        label: "Mock",
        icon: Database,
        className: "text-amber-700 bg-amber-50 ring-amber-200",
      };
    case "NO_DATA":
      return {
        label: "No data",
        icon: Database,
        className: "text-gray-600 bg-gray-50 ring-gray-200",
      };
    case "TIMEOUT":
      return {
        label: "Timeout",
        icon: Clock,
        className: "text-orange-700 bg-orange-50 ring-orange-200",
      };
    default:
      return {
        label: "Unavailable",
        icon: AlertCircle,
        className: "text-red-700 bg-red-50 ring-red-200",
      };
  }
}

function formatTimeAgo(iso) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}