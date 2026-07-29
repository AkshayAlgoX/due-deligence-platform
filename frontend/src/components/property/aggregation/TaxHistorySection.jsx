"use client";

import { Receipt } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatINRFull } from "@/utils/currency";

export default function TaxHistorySection({ section }) {
  const records = section?.data;

  return (
    <SectionCard
      title="Property tax history"
      subtitle="Assessment and payment records"
      icon={Receipt}
      section={section}
    >
      {records?.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-[#30363d]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#1c2128]">
              <tr>
                <Th>Year</Th>
                <Th>Assessed value</Th>
                <Th>Tax due</Th>
                <Th>Status</Th>
                <Th>Receipt</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#30363d]">
              {records.map((r) => (
                <tr key={r.assessmentYear} className="hover:bg-gray-50/60 dark:hover:bg-[#1c2128]">
                  <Td>
                    <span className="font-bold text-gray-900 dark:text-[#e6edf3]">
                      {r.assessmentYear}
                    </span>
                    <p className="text-[10px] text-gray-500 dark:text-[#7d8590]">
                      {r.municipality}
                    </p>
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
                      <code className="text-[10px] text-gray-600 dark:text-[#7d8590] font-mono">
                        {r.receiptNumber}
                      </code>
                    ) : (
                      <span className="text-[10px] text-gray-400 dark:text-[#6e7681]">—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : records?.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-[#7d8590] text-center py-4">
          No tax records available for this property.
        </p>
      ) : null}
    </SectionCard>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-4 py-3 text-sm text-gray-800 dark:text-[#e6edf3]">{children}</td>;
}

function StatusBadge({ status }) {
  const map = {
    PAID:    "text-green-700 dark:text-green-400 bg-green-50 dark:bg-[#0d2818] ring-green-200 dark:ring-green-900",
    PENDING: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-[#282a10] ring-amber-200 dark:ring-amber-900",
    OVERDUE: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-[#2d1214] ring-red-200 dark:ring-red-900",
  };
  const cls = map[status] || "text-gray-700 dark:text-[#e6edf3] bg-gray-50 dark:bg-[#1c2128] ring-gray-200 dark:ring-[#30363d]";
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${cls}`}>
      {status}
    </span>
  );
}