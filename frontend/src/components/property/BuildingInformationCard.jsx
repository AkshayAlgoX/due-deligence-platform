"use client";

import {
  Building2,
  Home,
  Layers,
  Bed,
  Bath,
  CheckCircle2,
  ShieldCheck,
  Plus,
} from "lucide-react";

/**
 * Building information card.
 *
 * Design principle: HONEST DATA
 *   - Reads directly from Property entity (user-entered fields)
 *   - Hides any field that's null/missing (no "N/A", no fake defaults)
 *   - Renders actionable empty state if nothing is available
 */
export default function BuildingInformationCard({ property, onEdit }) {
  if (!property) return null;

  const rows = [
    property.structureType && {
      icon: Building2,
      label: "Structure type",
      value: property.structureType,
    },
    property.condition && {
      icon: CheckCircle2,
      label: "Condition",
      value: property.condition,
    },
    property.stories != null && {
      icon: Layers,
      label: "Stories",
      value: `${property.stories} ${property.stories === 1 ? "story" : "stories"}`,
    },
    property.bedrooms != null && {
      icon: Bed,
      label: "Bedrooms",
      value: property.bedrooms,
    },
    property.bathrooms != null && {
      icon: Bath,
      label: "Bathrooms",
      value: property.bathrooms,
    },
    property.yearBuilt != null && {
      icon: Home,
      label: "Year built",
      value: property.yearBuilt,
    },
  ].filter(Boolean);

  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3] ring-1 ring-green-100 transition-transform duration-200 group-hover:scale-105">
            <Building2 className="h-5 w-5 text-[#16a34a]" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold tracking-tight text-gray-900">
              Building information
            </h3>
            <p className="mt-0.5 text-sm text-gray-500">
              Structural details you provided
            </p>
          </div>
        </div>

        <div className="inline-flex flex-shrink-0 items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-200">
          <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.5} />
          User provided
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="flex-1 p-6">
        {rows.length === 0 ? (
          // ✅ ACTIONABLE EMPTY STATE
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Building2 className="h-5 w-5 text-gray-400" strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              No building details added
            </p>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-gray-500">
              Add structure type, year built, bedrooms and more to improve risk scoring accuracy.
            </p>
            {onEdit && (
              <button
                onClick={onEdit}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#22C55E] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#16a34a] hover:shadow-md cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                Add building details
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.label}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/40 px-3 py-2.5 transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-100">
                    <Icon className="h-4 w-4 text-gray-500" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {row.label}
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {row.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}