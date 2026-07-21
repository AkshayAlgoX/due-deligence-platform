"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Radio,
  Database,
  RefreshCw,
} from "lucide-react";

/**
 * Aggregation health summary.
 *
 * Shows at-a-glance:
 *   - How many of the 6 sections returned data
 *   - How many are LIVE vs MOCK vs UNAVAILABLE
 *   - Total aggregation time
 *   - When it was last aggregated
 *   - Refresh button
 *
 * Reads `overallStatus` from AggregatedPropertyResponse.
 */
export default function DataCompletenessCard({ aggregated, onRefresh, refreshing }) {
  if (!aggregated) return null;

  const sections = [
    aggregated.ownership,
    aggregated.taxHistory,
    aggregated.zoning,
    aggregated.floodZone,
    aggregated.permits,
    aggregated.environmental,
  ];

  const liveCount = sections.filter(
    (s) => s?.status === "LIVE" || s?.status === "CACHED"
  ).length;
  const mockCount = sections.filter((s) => s?.status === "MOCK").length;
  const failedCount = sections.filter((s) =>
    ["UNAVAILABLE", "TIMEOUT", "ERROR", "NO_DATA"].includes(s?.status)
  ).length;

  const overall = aggregated.overallStatus;
  const config = getOverallConfig(overall);
  const OverallIcon = config.icon;

  const completionPercent = Math.round(
    ((liveCount + mockCount) / sections.length) * 100
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
            <OverallIcon className={`h-4 w-4 ${config.iconColor}`} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight">
              Data completeness
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Aggregation health across 6 data sources
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#22C55E] hover:text-[#16a34a] disabled:opacity-50"
            aria-label="Refresh aggregation"
            title="Refresh"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              strokeWidth={2.2}
            />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 flex-1">
        {/* Overall status */}
        <div className={`rounded-xl px-4 py-3 ring-1 ${config.panelClass}`}>
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${config.textColor}`}>
                Overall status
              </p>
              <p className={`mt-0.5 text-lg font-black ${config.textColor}`}>
                {config.label}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-black tabular-nums ${config.textColor}`}>
                {completionPercent}%
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${config.textColor} opacity-80`}>
                Coverage
              </p>
            </div>
          </div>
        </div>

        {/* Source breakdown */}
        <div className="grid grid-cols-3 gap-2">
          <SourceCell
            icon={Radio}
            iconColor="text-green-600"
            count={liveCount}
            label={liveCount === 1 ? "Live source" : "Live sources"}
          />
          <SourceCell
            icon={Database}
            iconColor="text-amber-600"
            count={mockCount}
            label={mockCount === 1 ? "Mock source" : "Mock sources"}
          />
          <SourceCell
            icon={XCircle}
            iconColor="text-red-500"
            count={failedCount}
            label={failedCount === 1 ? "Unavailable" : "Unavailable"}
          />
        </div>

        {/* Meta info */}
        {(aggregated.aggregatedAt || aggregated.totalDurationMs) && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-500">
            {aggregated.aggregatedAt && (
              <span>Fetched {formatTimeAgo(aggregated.aggregatedAt)}</span>
            )}
            {aggregated.totalDurationMs != null && (
              <span className="font-mono tabular-nums">
                {aggregated.totalDurationMs} ms
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SourceCell({ icon: Icon, iconColor, count, label }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-2 py-2.5 text-center">
      <Icon className={`h-3.5 w-3.5 mx-auto ${iconColor}`} strokeWidth={2.2} />
      <p className="mt-1 text-lg font-black text-gray-900 tabular-nums leading-none">
        {count}
      </p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-gray-500 leading-tight">
        {label}
      </p>
    </div>
  );
}

function getOverallConfig(status) {
  switch (status) {
    case "OK":
      return {
        label: "All sources available",
        icon: CheckCircle2,
        iconBg: "bg-green-50",
        iconColor: "text-green-600",
        textColor: "text-green-700",
        panelClass: "bg-green-50 ring-green-200",
      };
    case "PARTIAL":
      return {
        label: "Partial data",
        icon: AlertTriangle,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        textColor: "text-amber-700",
        panelClass: "bg-amber-50 ring-amber-200",
      };
    case "DEGRADED":
      return {
        label: "Degraded — some sources down",
        icon: XCircle,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        textColor: "text-red-700",
        panelClass: "bg-red-50 ring-red-200",
      };
    default:
      return {
        label: "Loading",
        icon: RefreshCw,
        iconBg: "bg-gray-50",
        iconColor: "text-gray-400",
        textColor: "text-gray-700",
        panelClass: "bg-gray-50 ring-gray-200",
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