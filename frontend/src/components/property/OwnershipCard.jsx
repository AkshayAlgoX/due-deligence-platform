"use client";

import { User, Calendar, Hash, FileText, Home, Info } from "lucide-react";
import SectionBadge from "./SectionBadge"; // if you have this — else inline it

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function timeAgo(timestamp) {
  if (!timestamp) return "";
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OwnershipCard({ section }) {
  const data = section?.data;
  const isMock = section?.source === "MOCK";
  const isLive = section?.source === "LIVE";
  const fetchedAt = section?.fetchedAt;

  const rows = [
    {
      icon: User,
      label: "Current Owner",
      value: data?.currentOwner || "—",
      strong: true,
    },
    {
      icon: User,
      label: "Co-Owners",
      value: data?.coOwners?.length ? data.coOwners.join(", ") : "—",
    },
    {
      icon: Home,
      label: "Ownership Type",
      value: data?.ownershipType || "—",
      badge: true,
    },
    {
      icon: Hash,
      label: "Registration No.",
      value: data?.registrationNumber || "—",
    },
    {
      icon: Calendar,
      label: "Registered On",
      value: formatDate(data?.registeredOn),
    },
    {
      icon: FileText,
      label: "Sub-Registrar Office",
      value: data?.subRegistrarOffice || "—",
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 ring-1 ring-green-100">
            <User className="h-5 w-5 text-[#16a34a]" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold tracking-tight text-gray-900">
              Ownership
            </h3>
            <p className="mt-0.5 text-sm text-gray-500">
              Current owner and registration details
            </p>
          </div>
        </div>

        {/* Source badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isMock && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
              Mock
            </span>
          )}
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700 ring-1 ring-green-200">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Live
            </span>
          )}
          {fetchedAt && (
            <span className="text-[11px] text-gray-400">
              {timeAgo(fetchedAt)}
            </span>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────── */}
      <div className="flex-1 p-6">
        {!data ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 ring-1 ring-gray-100">
                    <Icon className="h-4 w-4 text-gray-500" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      {row.label}
                    </p>
                    <p
                      className={`mt-0.5 text-sm text-gray-900 ${
                        row.strong ? "font-bold" : "font-medium"
                      } ${row.badge ? "inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold uppercase" : ""}`}
                    >
                      {row.value}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Financial row (registered value + stamp duty) */}
            {(data?.registeredValue || data?.stampDutyPaid) && (
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Registered Value
                  </p>
                  <p className="mt-0.5 text-base font-bold text-gray-900">
                    ₹{data.registeredValue?.toLocaleString("en-IN") || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Stamp Duty Paid
                  </p>
                  <p className="mt-0.5 text-base font-bold text-gray-900">
                    ₹{data.stampDutyPaid?.toLocaleString("en-IN") || "—"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer note ────────────────────────────────── */}
      {section?.note && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <p className="text-[11px] leading-relaxed text-gray-500">
              {section.note}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center py-8 text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <User className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-600">No ownership data</p>
      <p className="mt-1 text-xs text-gray-400">
        Data will appear once fetched from registry
      </p>
    </div>
  );
}