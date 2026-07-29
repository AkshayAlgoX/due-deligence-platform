"use client";

import { FileCheck } from "lucide-react";
import SectionCard from "./SectionCard";

const STATUS_STYLES = {
  APPROVED: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-[#0d2818] ring-green-200 dark:ring-green-900",
  PENDING:  "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-[#282a10] ring-amber-200 dark:ring-amber-900",
  EXPIRED:  "text-gray-600 dark:text-[#7d8590] bg-gray-100 dark:bg-[#1c2128] ring-gray-200 dark:ring-[#30363d]",
  REJECTED: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-[#2d1214] ring-red-200 dark:ring-red-900",
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
              className="rounded-xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#1c2128] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-[#edf7f3] dark:bg-[#0d2818] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#16a34a] dark:text-green-400">
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
                    <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">
                      {p.description}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-[#7d8590]">
                    {p.issuingAuthority}
                  </p>
                </div>
                <code className="flex-shrink-0 text-[10px] text-gray-600 dark:text-[#7d8590] font-mono">
                  {p.permitNumber}
                </code>
              </div>
              {(p.issueDate || p.expiryDate) && (
                <div className="mt-3 flex items-center gap-4 border-t border-gray-100 dark:border-[#30363d] pt-2 text-[11px] text-gray-600 dark:text-[#7d8590]">
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
        <p className="text-sm text-gray-500 dark:text-[#7d8590] text-center py-4">
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