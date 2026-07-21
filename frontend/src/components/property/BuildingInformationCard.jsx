"use client";

import {
  Building2,
  Home,
  Layers,
  Bed,
  Bath,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

/**
 * Building information card.
 *
 * Design principle: HONEST DATA
 *   - Reads directly from Property entity (user-entered fields)
 *   - Hides any field that's null/missing (no "N/A", no fake defaults)
 *   - Renders empty state if nothing is available
 */
export default function BuildingInformationCard({ property }) {
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
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3]">
            <Building2 className="h-4 w-4 text-[#16a34a]" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight">
              Building information
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Structural details you provided
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 ring-1 ring-gray-200">
          <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.5} />
          User provided
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No structural details added yet.
            <br />
            <span className="text-xs text-gray-400">
              Edit the property to add year built, bedrooms, and more.
            </span>
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.label}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/40 px-3 py-2"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white">
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