"use client";

import React from "react";
import {
  BadgeCheck,
  Ruler,
  Calendar,
  Building,
  Bed,
  Bath,
  Layers,
  UserRound,
  Pencil,
} from "lucide-react";
import { formatINRFull } from "@/utils/currency";
import { getPropertyHeroImage } from "@/constants/propertyImages";
import PropertyImagePlaceholder from "./PropertyImagePlaceholder";
import dynamic from "next/dynamic";
import { getUser } from "@/utils/helpers";

const DownloadPDFButton = dynamic(
  () => import("./pdf/DownloadPDFButton"),
  { ssr: false }
);

/**
 * Hero card for property details.
 *
 * Design principle: HONEST DATA
 *  - Never invent values (no "0.45 Acres" default)
 *  - Only render fields that have real backend data
 *  - Grid auto-adapts to available fields (2/3/4 cols)
 *  - Bedrooms/bathrooms shown Zillow-style: "4 bd · 2 ba · 1,848 sqft"
 *  - Empty means empty. No ghost labels.
 *
 * Milestone 2 note:
 *  - lotSize, zoning, yearBuilt currently user-entered
 *  - After aggregation lands, they may come from land-registry service
 *  - "Data source" pill will differentiate MANUAL vs AGGREGATED
 */
export default function PropertyDetails({ property, onEdit }) {

  if (!property) return null;

  const currentUser = getUser();
  const canEdit = onEdit && currentUser && (currentUser.role === "ADMIN" || ["BUYER", "REAL_ESTATE_AGENT"].includes(currentUser.role));

  const {
    id,
    address,
    city,
    state,
    zipCode,
    propertyType,
    marketValue,
    area,
    lotSize,
    yearBuilt,
    zoning,
    bedrooms,
    bathrooms,
    stories,
    verified,
  } = property;

  const locationLine = [city, state].filter(Boolean).join(", ");
  const fullAddress = [
    address,
    locationLine || null,
    zipCode || null,
  ]
    .filter(Boolean)
    .join(", ")
    .replace(/, ([\d]{6})$/, " $1"); // PIN sits after location without comma

  

  // ── Zillow-style quick facts pill ────────────────────────────────
  // Only shown if at least one exists
  const quickFacts = [
    bedrooms != null && { icon: Bed, value: `${bedrooms} bd` },
    bathrooms != null && { icon: Bath, value: `${bathrooms} ba` },
    area != null && area > 0 && {
      icon: Ruler,
      value: `${area.toLocaleString()} sqft`,
    },
  ].filter(Boolean);

  // ── Hero stat blocks (grid) ──────────────────────────────────────
  // Only show if data exists. No "N/A", no defaults.
  const stats = [
    yearBuilt != null && {
      icon: Calendar,
      label: "Year built",
      value: String(yearBuilt),
    },
    stories != null && {
      icon: Layers,
      label: "Stories",
      value: String(stories),
    },
    lotSize != null && lotSize > 0 && {
      icon: Ruler,
      label: "Lot size",
      value: `${lotSize.toLocaleString()} sqft`,
    },
    zoning && {
      icon: Building,
      label: "Zoning",
      value: zoning,
    },
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT: Image */}
        <div className="relative min-h-[380px]">
          {getPropertyHeroImage(property) ? (
            <img
              src={getPropertyHeroImage(property)}
              alt={address || "Property"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <PropertyImagePlaceholder
              propertyType={propertyType}
              size="hero"
            />
          )}

          {/* Verification badge — REAL backend value */}
          {verified && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
              <BadgeCheck className="h-4 w-4 text-[#22C55E]" strokeWidth={2.5} />
              <span className="text-xs font-bold text-gray-800">
                Verified property
              </span>
            </div>
          )}

          {!verified && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 shadow-md backdrop-blur-sm ring-1 ring-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-amber-800">
                Pending verification
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: Details */}
        <div className="flex flex-col p-8">
                   {/* Property type + data source pill + edit */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
  <div className="flex items-center gap-2 flex-wrap">
    {propertyType && (
      <p className="text-xs font-bold uppercase tracking-widest text-[#22C55E]">
        {propertyType}
      </p>
    )}
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-500 ring-1 ring-gray-200">
      <UserRound className="h-2.5 w-2.5" strokeWidth={2.5} />
      User provided
    </span>
  </div>

  {/* Action buttons */}
  <div className="flex items-center gap-2">
    <DownloadPDFButton property={property} />
        {canEdit && (
      <button
        type="button"
        onClick={() => onEdit(property)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all duration-150 hover:border-[#22C55E] hover:text-[#16a34a] active:scale-95"
      >
        <Pencil className="h-3 w-3" strokeWidth={2.4} />
        Edit details
      </button>
    )}
  </div>
</div>

          {/* Address + price */}
          <div className="mt-3 flex items-start justify-between gap-6">
            <h2 className="text-[26px] font-black leading-[30px] tracking-tight text-gray-900">
              {fullAddress}
            </h2>

            {marketValue != null && marketValue > 0 && (
              <div className="flex-shrink-0 text-right">
                <p className="text-[30px] font-black leading-none tracking-tight text-gray-900">
                  {formatINRFull(marketValue)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Estimated market value
                </p>
              </div>
            )}
          </div>

          {/* Zillow-style quick facts */}
          {quickFacts.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              {quickFacts.map((fact, idx) => {
                const Icon = fact.icon;
                return (
                  <React.Fragment key={fact.value}>
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className="h-4 w-4 text-gray-400"
                        strokeWidth={2}
                      />
                      <span className="text-sm font-bold text-gray-900">
                        {fact.value}
                      </span>
                    </div>
                    {idx < quickFacts.length - 1 && (
                      <span className="text-gray-300">·</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Stats grid — only if any exists */}
          {stats.length > 0 && (
            <>
              <div className="my-6 h-px bg-gray-100" />
              <div
                className={`grid gap-6 ${
                  stats.length === 1
                    ? "grid-cols-1"
                    : stats.length === 2
                    ? "grid-cols-2"
                    : stats.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-4"
                }`}
              >
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label}>
                      <Icon className="h-4 w-4 text-gray-400" strokeWidth={2} />
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-base font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          
        </div>
      </div>
    </div>
  );
}