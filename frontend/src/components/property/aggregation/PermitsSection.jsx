"use client";

import { FileCheck } from "lucide-react";
import SectionCard from "./SectionCard";

const STATUS_STYLES = {
  APPROVED: "text-green-700 bg-green-50 ring-green-200",
  PENDING:  "text-amber-700 bg-amber-50 ring-amber-200",
  EXPIRED:  "text-gray-600  bg-gray-100  ring-gray-200",
  REJECTED: "text-red-700   bg-red-50   ring-red-200",
};

export default function PermitsSection({ section }) {
  const permits = section?.data;

  return (
    <SectionCard
      title="Permits & approvals"
      subtitle="Building, occupancy and renovation permits"
      icon={FileCheck}
      section={section}
    >
      {permits?.length > 0 ? (
        <ul className="space-y-3">
          {permits.map((p, i) => (
            <li
              key={i}
              className="rounded-xl border border-gray-100 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-[#edf7f3] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#16a34a]">
                      {p.permitType}
                    </span>
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${
                        STATUS_STYLES[p.status] ?? STATUS_STYLES.PENDING
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  {p.description && (
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {p.description}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-gray-500">
                    {p.issuingAuthority}
                  </p>
                </div>
                <code className="flex-shrink-0 text-[10px] text-gray-600 font-mono">
                  {p.permitNumber}
                </code>
              </div>
              {(p.issueDate || p.expiryDate) && (
                <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-2 text-[11px] text-gray-600">
                  {p.issueDate && (
                    <span>
                      <span className="font-semibold">Issued:</span>{" "}
                      {formatDate(p.issueDate)}
                    </span>
                  )}
                  {p.expiryDate && (
                    <span>
                      <span className="font-semibold">Expires:</span>{" "}
                      {formatDate(p.expiryDate)}
                    </span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : permits?.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No permits recorded for this property.
        </p>
      ) : null}
    </SectionCard>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}