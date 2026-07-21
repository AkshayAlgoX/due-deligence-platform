"use client";

import { UserRound, ScrollText } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatINRFull } from "@/utils/currency";

/**
 * Ownership + land registry section.
 *
 * REFERENCE PATTERN for teammates 3-5:
 *   1. Accept `section` prop (IntegrationResponse<T>)
 *   2. Wrap content in <SectionCard section={section} ...>
 *   3. Read data from section.data (only when hasData is true)
 *   4. Zero fake defaults — if a field is null, hide it or say "—"
 */
export default function OwnershipCard({ section }) {
  const record = section?.data;

  return (
    <SectionCard
      title="Ownership"
      subtitle="Current owner and registration details"
      icon={UserRound}
      section={section}
    >
      {record && (
        <div className="space-y-4">
          {/* Current owner */}
          <Row label="Current owner" value={record.currentOwner} />

          {/* Co-owners */}
          {record.coOwners?.length > 0 && (
            <Row
              label="Co-owners"
              value={record.coOwners.join(", ")}
            />
          )}

          {/* Ownership type */}
          {record.ownershipType && (
            <Row
              label="Ownership type"
              value={
                <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
                  {record.ownershipType.replace(/_/g, " ")}
                </span>
              }
            />
          )}

          {/* Registration */}
          {(record.registrationNumber || record.registrationDate) && (
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              {record.registrationNumber && (
                <Row
                  compact
                  label="Registration no."
                  value={
                    <code className="font-mono text-xs text-gray-800">
                      {record.registrationNumber}
                    </code>
                  }
                />
              )}
              {record.registrationDate && (
                <Row
                  compact
                  label="Registered on"
                  value={formatDate(record.registrationDate)}
                />
              )}
            </div>
          )}

          {/* Sub-registrar office */}
          {record.subRegistrarOffice && (
            <Row
              label="Sub-registrar office"
              value={record.subRegistrarOffice}
            />
          )}

          {/* Financials */}
          {(record.registeredValue || record.stampDutyPaid) && (
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              {record.registeredValue != null && (
                <Row
                  compact
                  label="Registered value"
                  value={formatINRFull(record.registeredValue)}
                />
              )}
              {record.stampDutyPaid != null && (
                <Row
                  compact
                  label="Stamp duty paid"
                  value={formatINRFull(record.stampDutyPaid)}
                />
              )}
            </div>
          )}

          {/* Ownership history */}
          {record.ownershipHistory?.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <div className="mb-3 flex items-center gap-1.5">
                <ScrollText className="h-3 w-3 text-gray-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Previous owners
                </p>
              </div>
              <ul className="space-y-2">
                {record.ownershipHistory.map((h, i) => (
                  <li
                    key={i}
                    className="rounded-lg bg-gray-50 px-3 py-2 text-xs"
                  >
                    <p className="font-semibold text-gray-900">{h.ownerName}</p>
                    <p className="mt-0.5 text-gray-500">
                      {formatDate(h.ownedFrom)} → {formatDate(h.ownedUntil)}
                      {h.transferReason && (
                        <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
                          {h.transferReason}
                        </span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function Row({ label, value, compact = false }) {
  return (
    <div className={compact ? "" : "flex items-start justify-between gap-4"}>
      <p
        className={`text-[10px] font-bold uppercase tracking-widest text-gray-500 ${
          compact ? "mb-1" : "flex-shrink-0"
        }`}
      >
        {label}
      </p>
      <div className={`text-sm font-semibold text-gray-900 ${compact ? "" : "text-right"}`}>
        {value ?? <span className="text-gray-400">—</span>}
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}