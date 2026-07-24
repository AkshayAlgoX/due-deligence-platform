"use client";

/**
 * TaxHistoryTable
 *
 * Displays property tax assessment history from real backend data.
 *
 * Data flow:
 *   parent passes `taxHistory` prop → IntegrationResponse<List<TaxRecord>>
 *   shape: { status, data: TaxRecord[], dataSource, retrievedAt, reason }
 *
 * TaxRecord fields (from backend TaxRecord.java):
 *   assessmentYear, assessedValue, taxAmount, status (PAID|PENDING|OVERDUE),
 *   receiptNumber, paidDate, dueDate, municipality
 *
 * States handled:
 *   loading  → skeleton rows
 *   no data  → "No tax records available"
 *   error    → section unavailable message
 *   success  → table with real records
 *
 * Uses:
 *   - formatINRFull  from @/utils/currency   (existing project formatter)
 *   - Receipt icon   from lucide-react       (existing icon library)
 *   - No new dependencies, no hardcoded data
 */

import { Receipt } from "lucide-react";
import { formatINRFull } from "@/utils/currency";
import { Skeleton } from "@/components/ui/Skeleton";

// ── Status badge styles (PAID=green, PENDING=amber, OVERDUE=red) ─────────────
const STATUS_STYLES = {
  PAID:    "text-green-700 bg-green-50 ring-green-200",
  PENDING: "text-amber-700 bg-amber-50 ring-amber-200",
  OVERDUE: "text-red-700   bg-red-50   ring-red-200",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Th({ children }) {
  return (
    <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 text-sm text-gray-800 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? "text-gray-700 bg-gray-50 ring-gray-200";
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${cls}`}
    >
      {status}
    </span>
  );
}

/** Skeleton rows shown while data is loading */
function SkeletonRows({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="border-b border-gray-100">
      <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-md" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
    </tr>
  ));
}

/** Empty state when no records exist */
function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="px-4 py-10 text-center">
        <p className="text-sm font-semibold text-gray-700">No tax records available</p>
        <p className="mt-1 text-xs text-gray-400">
          No tax history data exists for this property.
        </p>
      </td>
    </tr>
  );
}

/** Error / unavailable state */
function ErrorState({ reason }) {
  return (
    <tr>
      <td colSpan={5} className="px-4 py-10 text-center">
        <p className="text-sm font-semibold text-gray-700">Section unavailable</p>
        <p className="mt-1 text-xs text-gray-400">
          {reason || "Tax history could not be retrieved at this time."}
        </p>
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {{ taxHistory: IntegrationResponse<TaxRecord[]>, loading?: boolean }} props
 *
 * `taxHistory` is an IntegrationResponse section from AggregatedPropertyResponse.
 * `loading` is true while the parent is fetching aggregation data.
 */
export default function TaxHistoryTable({ taxHistory, loading = false }) {
  // Derive state from the section prop
  const records = taxHistory?.data;
  const isError =
    taxHistory &&
    ["UNAVAILABLE", "TIMEOUT", "ERROR"].includes(taxHistory.status);
  const hasRecords =
    Array.isArray(records) && records.length > 0;

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col">

      {/* Header */}
      <div className="flex items-start gap-3 border-b border-gray-100 px-6 py-5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3]">
          <Receipt className="h-4 w-4 text-[#16a34a]" strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 tracking-tight">
            Tax Assessment History
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Historical tax data
          </p>
        </div>
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <Th>Year</Th>
              <Th>Assessed Value</Th>
              <Th>Tax Amount</Th>
              <Th>Status</Th>
              <Th>Receipt</Th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {/* Loading state */}
            {loading && <SkeletonRows count={4} />}

            {/* Error state */}
            {!loading && isError && (
              <ErrorState reason={taxHistory?.reason} />
            )}

            {/* Empty state — section loaded but no records */}
            {!loading && !isError && !hasRecords && (
              <EmptyState />
            )}

            {/* Data rows */}
            {!loading && hasRecords &&
              records.map((r) => (
                <tr
                  key={r.assessmentYear}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <Td>
                    <span className="font-bold text-gray-900">
                      {r.assessmentYear}
                    </span>
                    {r.municipality && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {r.municipality}
                      </p>
                    )}
                  </Td>

                  <Td>
                    <span className="tabular-nums">
                      {formatINRFull(r.assessedValue)}
                    </span>
                  </Td>

                  <Td>
                    <span className="font-semibold tabular-nums">
                      {formatINRFull(r.taxAmount)}
                    </span>
                  </Td>

                  <Td>
                    <StatusBadge status={r.status} />
                  </Td>

                  <Td>
                    {r.receiptNumber ? (
                      <code className="text-[10px] text-gray-600 font-mono">
                        {r.receiptNumber}
                      </code>
                    ) : (
                      <span className="text-[10px] text-gray-400">—</span>
                    )}
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
