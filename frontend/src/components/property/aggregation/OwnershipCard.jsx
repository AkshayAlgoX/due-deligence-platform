"use client";

import { User, Calendar, Hash, FileText, Home, Users } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatINRFull } from "@/utils/currency";

export default function OwnershipCard({ section }) {
  const data = section?.data;

  return (
    <SectionCard
      title="Ownership"
      subtitle="Current owner and registration details"
      icon={User}
      section={section}
    >
      {data && (
        <div className="space-y-5">
          {/* Primary owner block */}
          <div className="rounded-xl bg-[#edf7f3] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#16a34a]">
              Current owner
            </p>
            <p className="mt-1 text-lg font-black text-gray-900">
              {data.currentOwner || "—"}
            </p>
            {data.coOwners?.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-600">
                <Users className="h-3 w-3" />
                <span className="font-semibold">
                  Co-owners: {data.coOwners.join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Ownership type badge */}
          {data.ownershipType && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 ring-1 ring-gray-100">
                  <Home className="h-4 w-4 text-gray-500" strokeWidth={2} />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Ownership type
                </p>
              </div>
              <span className="rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                {data.ownershipType}
              </span>
            </div>
          )}

          {/* Registration details */}
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <DetailRow
              icon={Hash}
              label="Registration No."
              value={data.registrationNumber}
              mono
            />
            <DetailRow
              icon={Calendar}
              label="Registered On"
              value={formatDate(data.registeredOn)}
            />
            <DetailRow
              icon={FileText}
              label="Sub-Registrar Office"
              value={data.subRegistrarOffice}
            />
          </div>

          {/* Financial summary */}
          {(data.registeredValue || data.stampDutyPaid) && (
            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
              <FinancialCell
                label="Registered Value"
                value={data.registeredValue}
              />
              <FinancialCell
                label="Stamp Duty Paid"
                value={data.stampDutyPaid}
              />
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function DetailRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 ring-1 ring-gray-100">
        <Icon className="h-4 w-4 text-gray-500" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm font-semibold text-gray-900 ${
            mono ? "font-mono text-xs" : ""
          }`}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function FinancialCell({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-gray-900 tabular-nums">
        {value != null ? formatINRFull(value) : "—"}
      </p>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}