"use client";

import { AlertTriangle, Info } from "lucide-react";
import DataSourceBadge from "./DataSourceBadge";

/**
 * Standard wrapper for every aggregation section.
 * Handles loading / no-data / error uniformly so cards look consistent.
 *
 * Renders:
 *   - Header (title + icon + data source badge)
 *   - Body:
 *       - loading  → children (already a skeleton)
 *       - error    → gray card with reason
 *       - no data  → "No records" message
 *       - success  → children (the real content)
 */
export default function SectionCard({
  title,
  subtitle,
  icon: Icon,
  section,
  loading = false,
  children,
}) {
  const hasData =
    section &&
    ["LIVE", "CACHED", "MOCK"].includes(section.status) &&
    section.data != null;

  const isError =
    section &&
    ["UNAVAILABLE", "TIMEOUT", "ERROR"].includes(section.status);

  const isNoData = section && section.status === "NO_DATA";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3]">
              <Icon className="h-4 w-4 text-[#16a34a]" strokeWidth={2.2} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-black text-gray-900 tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
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
      <div className="p-5 flex-1">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
          </div>
        ) : isError ? (
          <ErrorState reason={section.reason} />
        ) : isNoData ? (
          <NoDataState reason={section.reason} />
        ) : hasData ? (
          children
        ) : (
          <ErrorState reason="Section not loaded yet" />
        )}
      </div>

      {/* Footer — mock reason (only when data present but source is mock) */}
      {hasData && section.status === "MOCK" && section.reason && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-2.5">
          <div className="flex items-start gap-2">
            <Info className="h-3 w-3 flex-shrink-0 mt-0.5 text-gray-400" />
            <p className="text-[10px] text-gray-500 leading-relaxed">
              {section.reason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ErrorState({ reason }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
      <AlertTriangle
        className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-400"
        strokeWidth={2}
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-700">
          Section unavailable
        </p>
        <p className="mt-1 text-xs text-gray-500 leading-relaxed">
          {reason || "External service could not be reached."}
        </p>
      </div>
    </div>
  );
}

function NoDataState({ reason }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 text-center">
      <p className="text-sm font-semibold text-gray-700">No records found</p>
      <p className="mt-1 text-xs text-gray-500">
        {reason || "No data exists for this property."}
      </p>
    </div>
  );
}