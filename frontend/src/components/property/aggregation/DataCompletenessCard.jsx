"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Radio,
  Database,
  RefreshCw,
  Clock,
  Zap,
  User,
  Receipt,
  Map as MapIcon,
  Waves,
  FileCheck,
  Wind,
} from "lucide-react";

const SECTION_META = {
  ownership:     { key: "ownership",     label: "Ownership Registry",    icon: User },
  taxHistory:    { key: "taxHistory",    label: "Municipal Tax Records", icon: Receipt },
  zoning:        { key: "zoning",        label: "Zoning Authority",      icon: MapIcon },
  floodZone:     { key: "floodZone",     label: "Flood Risk Assessment", icon: Waves },
  permits:       { key: "permits",       label: "Permits Database",      icon: FileCheck },
  environmental: { key: "environmental", label: "Environmental Monitoring", icon: Wind },
};

export default function DataCompletenessCard({ aggregated, onRefresh, refreshing }) {
  if (!aggregated) return null;

  const sectionList = Object.keys(SECTION_META).map((key) => ({
    ...SECTION_META[key],
    section: aggregated[key],
  }));

  const sections = sectionList.map((s) => s.section);

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

  const timestamps = sections
    .map((s) => s?.retrievedAt)
    .filter(Boolean)
    .map((t) => new Date(t).getTime());

  const oldest = timestamps.length ? Math.min(...timestamps) : null;
  const newest = timestamps.length ? Math.max(...timestamps) : null;

  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-[#484f58] hover:shadow-md dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 dark:border-[#30363d] px-6 py-5">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105 ${config.iconBg} ${config.iconRing}`}
          >
            <OverallIcon
              className={`h-5 w-5 ${config.iconColor}`}
              strokeWidth={2.2}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-[#e6edf3]">
              Data completeness
            </h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-[#7d8590]">
              Aggregation health across 6 data sources
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] text-gray-500 dark:text-[#7d8590] transition hover:border-[#22C55E] hover:text-[#16a34a] dark:hover:text-green-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            aria-label="Refresh aggregation"
            title="Refresh all sources"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              strokeWidth={2.2}
            />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 p-6">

        {/* 1. Overall status banner */}
        <div className={`rounded-xl px-4 py-3.5 ring-1 ${config.panelClass}`}>
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
              <p className={`text-[10px] font-bold uppercase tracking-widest opacity-80 ${config.textColor}`}>
                Coverage
              </p>
            </div>
          </div>
        </div>

        {/* 2. Source count row */}
        <div className="grid grid-cols-3 gap-2">
          <SourceCell
            icon={Radio}
            iconColor="text-green-600 dark:text-green-400"
            bgColor="bg-green-50/50 dark:bg-[#0d2818]"
            ringColor="ring-green-100 dark:ring-green-900"
            count={liveCount}
            label={liveCount === 1 ? "Live source" : "Live sources"}
          />
          <SourceCell
            icon={Database}
            iconColor="text-amber-600 dark:text-amber-400"
            bgColor="bg-amber-50/50 dark:bg-[#282a10]"
            ringColor="ring-amber-100 dark:ring-amber-900"
            count={mockCount}
            label={mockCount === 1 ? "Mock source" : "Mock sources"}
          />
          <SourceCell
            icon={XCircle}
            iconColor="text-red-500 dark:text-red-400"
            bgColor="bg-red-50/50 dark:bg-[#2d1214]"
            ringColor="ring-red-100 dark:ring-red-900"
            count={failedCount}
            label="Unavailable"
          />
        </div>

        {/* 3. Source breakdown list */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
              Data sources
            </p>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-[#6e7681]">
              {sections.length} total
            </p>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-[#30363d] rounded-xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#0d1117]">
            {sectionList.map(({ key, label, icon: Icon, section }) => (
              <SourceRow
                key={key}
                icon={Icon}
                label={label}
                status={section?.status}
                retrievedAt={section?.retrievedAt}
                durationMs={section?.durationMs}
              />
            ))}
          </div>
        </div>

        {/* 4. Freshness footer */}
        {(oldest || newest || aggregated.totalDurationMs != null) && (
          <div className="mt-auto rounded-xl bg-gray-50 dark:bg-[#1c2128] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
              {newest && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-gray-400 dark:text-[#7d8590]" />
                  <span className="text-gray-500 dark:text-[#7d8590]">Latest fetch:</span>
                  <span className="font-bold text-gray-800 dark:text-[#e6edf3]">
                    {formatTimeAgo(newest)}
                  </span>
                </div>
              )}
              {oldest && oldest !== newest && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-gray-400 dark:text-[#7d8590]" />
                  <span className="text-gray-500 dark:text-[#7d8590]">Oldest:</span>
                  <span className="font-bold text-gray-800 dark:text-[#e6edf3]">
                    {formatTimeAgo(oldest)}
                  </span>
                </div>
              )}
              {aggregated.totalDurationMs != null && (
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-gray-400 dark:text-[#7d8590]" />
                  <span className="text-gray-500 dark:text-[#7d8590]">Duration:</span>
                  <span className="font-mono font-bold tabular-nums text-gray-800 dark:text-[#e6edf3]">
                    {aggregated.totalDurationMs}ms
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SourceCell({ icon: Icon, iconColor, bgColor, ringColor, count, label }) {
  return (
    <div className={`rounded-lg px-2 py-2.5 text-center ring-1 ${bgColor} ${ringColor}`}>
      <Icon className={`mx-auto h-3.5 w-3.5 ${iconColor}`} strokeWidth={2.2} />
      <p className="mt-1 text-lg font-black leading-none tabular-nums text-gray-900 dark:text-[#e6edf3]">
        {count}
      </p>
      <p className="mt-1 text-[9px] font-bold uppercase leading-tight tracking-wider text-gray-500 dark:text-[#7d8590]">
        {label}
      </p>
    </div>
  );
}

function SourceRow({ icon: Icon, label, status, retrievedAt, durationMs }) {
  const statusConfig = getStatusConfig(status);

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-gray-50/60 dark:hover:bg-[#1c2128]">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-[#1c2128] ring-1 ring-gray-100 dark:ring-[#30363d]">
          <Icon className="h-3.5 w-3.5 text-gray-500 dark:text-[#7d8590]" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-gray-800 dark:text-[#e6edf3]">
            {label}
          </p>
          {retrievedAt && (
            <p className="text-[10px] text-gray-400 dark:text-[#6e7681]">
              {formatTimeAgo(new Date(retrievedAt).getTime())}
              {durationMs != null && ` • ${durationMs}ms`}
            </p>
          )}
        </div>
      </div>

      <span
        className={`inline-flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${statusConfig.className}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
        {statusConfig.label}
      </span>
    </div>
  );
}

function getOverallConfig(status) {
  switch (status) {
    case "OK":
      return {
        label: "All sources available",
        icon: CheckCircle2,
        iconBg: "bg-green-50 dark:bg-[#0d2818]",
        iconRing: "ring-green-100 dark:ring-green-900",
        iconColor: "text-green-600 dark:text-green-400",
        textColor: "text-green-700 dark:text-green-400",
        panelClass: "bg-green-50 dark:bg-[#0d2818] ring-green-200 dark:ring-green-900",
      };
    case "PARTIAL":
      return {
        label: "Partial data",
        icon: AlertTriangle,
        iconBg: "bg-amber-50 dark:bg-[#282a10]",
        iconRing: "ring-amber-100 dark:ring-amber-900",
        iconColor: "text-amber-600 dark:text-amber-400",
        textColor: "text-amber-700 dark:text-amber-400",
        panelClass: "bg-amber-50 dark:bg-[#282a10] ring-amber-200 dark:ring-amber-900",
      };
    case "DEGRADED":
      return {
        label: "Degraded — some sources down",
        icon: XCircle,
        iconBg: "bg-red-50 dark:bg-[#2d1214]",
        iconRing: "ring-red-100 dark:ring-red-900",
        iconColor: "text-red-500 dark:text-red-400",
        textColor: "text-red-700 dark:text-red-400",
        panelClass: "bg-red-50 dark:bg-[#2d1214] ring-red-200 dark:ring-red-900",
      };
    default:
      return {
        label: "Loading",
        icon: RefreshCw,
        iconBg: "bg-gray-50 dark:bg-[#1c2128]",
        iconRing: "ring-gray-100 dark:ring-[#30363d]",
        iconColor: "text-gray-400 dark:text-[#7d8590]",
        textColor: "text-gray-700 dark:text-[#e6edf3]",
        panelClass: "bg-gray-50 dark:bg-[#1c2128] ring-gray-200 dark:ring-[#30363d]",
      };
  }
}

function getStatusConfig(status) {
  switch (status) {
    case "LIVE":
      return {
        label: "Live",
        className: "bg-green-50 dark:bg-[#0d2818] text-green-700 dark:text-green-400 ring-green-200 dark:ring-green-900",
        dot: "bg-green-500 animate-pulse",
      };
    case "CACHED":
      return {
        label: "Cached",
        className: "bg-blue-50 dark:bg-[#0c1f33] text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-900",
        dot: "bg-blue-500",
      };
    case "MOCK":
      return {
        label: "Mock",
        className: "bg-amber-50 dark:bg-[#282a10] text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-900",
        dot: "bg-amber-500",
      };
    case "NO_DATA":
      return {
        label: "Empty",
        className: "bg-gray-100 dark:bg-[#1c2128] text-gray-600 dark:text-[#7d8590] ring-gray-200 dark:ring-[#30363d]",
        dot: "bg-gray-400",
      };
    case "UNAVAILABLE":
    case "TIMEOUT":
    case "ERROR":
      return {
        label: "Down",
        className: "bg-red-50 dark:bg-[#2d1214] text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-900",
        dot: "bg-red-500",
      };
    default:
      return {
        label: "—",
        className: "bg-gray-50 dark:bg-[#1c2128] text-gray-500 dark:text-[#7d8590] ring-gray-200 dark:ring-[#30363d]",
        dot: "bg-gray-300 dark:bg-[#6e7681]",
      };
  }
}

function formatTimeAgo(input) {
  const ms = typeof input === "number" ? input : new Date(input).getTime();
  const secs = Math.floor((Date.now() - ms) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}