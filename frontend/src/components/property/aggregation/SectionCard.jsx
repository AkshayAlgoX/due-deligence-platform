"use client";

import { AlertTriangle, Info, Inbox } from "lucide-react";
import DataSourceBadge from "./DataSourceBadge";

export default function SectionCard({
  title,
  subtitle,
  icon: Icon,
  section,
  loading = false,
  children,
  emptyAction,
  emptyIcon: EmptyIcon,
}) {
  const hasData =
    section &&
    ["LIVE", "CACHED", "MOCK"].includes(section.status) &&
    section.data != null &&
    (!Array.isArray(section.data) || section.data.length > 0);

  const isError =
    section &&
    ["UNAVAILABLE", "TIMEOUT", "ERROR"].includes(section.status);

  const isNoData =
    section &&
    (section.status === "NO_DATA" ||
      (Array.isArray(section.data) && section.data.length === 0));

  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-[#484f58] hover:shadow-md dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 dark:border-[#30363d] px-6 py-5">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818] ring-1 ring-green-100 dark:ring-green-900 transition-transform duration-200 group-hover:scale-105">
              <Icon className="h-5 w-5 text-[#16a34a] dark:text-green-400" strokeWidth={2.2} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-[#e6edf3]">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-[#7d8590]">{subtitle}</p>
            )}
          </div>
        </div>

        {section && (
          <DataSourceBadge
            status={section.status}
            dataSource={section.dataSource}
            retrievedAt={section.retrievedAt}
          />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-6">
        {loading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorState reason={section.reason} />
        ) : isNoData ? (
          <EmptyState
            reason={section.reason}
            icon={EmptyIcon || Icon}
            title={title}
            action={emptyAction}
          />
        ) : hasData ? (
          children
        ) : (
          <EmptyState
            reason="Waiting for data..."
            icon={EmptyIcon || Icon}
            title={title}
          />
        )}
      </div>

      {/* Footer note (only when mock) */}
      {hasData && section.status === "MOCK" && section.reason && (
        <div className="border-t border-gray-100 dark:border-[#30363d] bg-gray-50/60 dark:bg-[#0d1117] px-6 py-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-[#7d8590]" />
            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-[#7d8590]">
              {section.reason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100 dark:bg-[#1c2128]" />
      <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-[#1c2128]" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100 dark:bg-[#1c2128]" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-[#1c2128]" />
    </div>
  );
}

// ── Error state ──────────────────────────────────────────────────
function ErrorState({ reason }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-[#282a10] ring-1 ring-amber-100 dark:ring-amber-900">
        <AlertTriangle
          className="h-5 w-5 text-amber-500 dark:text-amber-400"
          strokeWidth={2.2}
        />
      </div>
      <p className="text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">
        Section temporarily unavailable
      </p>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-gray-500 dark:text-[#7d8590]">
        {reason || "External data source could not be reached. Try again shortly."}
      </p>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────
function EmptyState({ reason, icon: Icon, title, action }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1c2128]">
        {Icon ? (
          <Icon className="h-5 w-5 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
        ) : (
          <Inbox className="h-5 w-5 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
        )}
      </div>
      <p className="text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">
        No {title?.toLowerCase() || "data"} available
      </p>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-gray-500 dark:text-[#7d8590]">
        {reason || "No records exist for this property yet."}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#22C55E] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#16a34a] hover:shadow-md cursor-pointer"
        >
          {action.icon && <action.icon className="h-3.5 w-3.5" strokeWidth={2.5} />}
          {action.label}
        </button>
      )}
    </div>
  );
}