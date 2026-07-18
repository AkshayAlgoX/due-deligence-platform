"use client";

import {
  BadgeCheck,
  MapPin,
  Maximize,
  ArrowUpRight,
  Home,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import { formatINR } from "@/utils/currency";
import { getPropertyImage } from "@/constants/propertyImages";
import PropertyImagePlaceholder from "./PropertyImagePlaceholder";

/**
 * PropertyResultCard — the search result grid card.
 *
 * Now shows honest verification state:
 *  - Verified badge (green): all 7 data quality checks passed
 *  - Pending badge (amber): shows how many checks passed with tooltip
 *  - Edit button appears on pending cards → triggers onEdit prop
 */
export default function PropertyResultCard({
  property,
  isSelected,
  onClick,
  onEdit,
}) {
  if (!property) return null;

  const {
    address = "Unknown Address",
    city = "",
    state = "",
    zipCode = "",
    propertyType = "Property",
    marketValue,
    area,
    bedrooms,
    bathrooms,
    verified,
    missingFields = [],
    totalChecks = 7,
  } = property;

  const thumbnail = getPropertyImage(property);
  const passedChecks = totalChecks - missingFields.length;

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit?.(property);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white text-left transition-all duration-500 ${
        isSelected
          ? "shadow-[0_20px_60px_rgba(34,197,94,0.3)] ring-2 ring-[#22C55E] scale-[1.02]"
          : "shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:-translate-y-2 hover:ring-gray-200"
      }`}
    >
      <div className="relative h-44 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={address}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <PropertyImagePlaceholder propertyType={propertyType} />
        )}

        {thumbnail && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        )}

        {/* ── VERIFICATION BADGE — now honest ──────────────────────── */}
        {verified ? (
          <div
            className="group/badge absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 pl-2 pr-3 py-1.5 shadow-xl backdrop-blur-md ring-1 ring-white/40 cursor-help"
            title={`Verified — all ${totalChecks} data quality checks passed`}
          >
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a]">
              <BadgeCheck className="h-3 w-3 text-white" strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-900">
              Verified
            </span>
          </div>
        ) : (
          <div
            className="group/badge absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 pl-2 pr-3 py-1.5 shadow-xl backdrop-blur-md ring-1 ring-amber-200 cursor-help"
            title={`Pending — ${passedChecks} of ${totalChecks} checks passed.\nMissing: ${missingFields.join(", ")}`}
          >
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-300">
              <AlertTriangle className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-700">
  Incomplete · {passedChecks}/{totalChecks}
</span>
          </div>
        )}

        <div className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16a34a] px-3 py-1.5 shadow-xl shadow-green-500/50 ring-1 ring-white/30">
          <span className="text-[10px] font-black uppercase tracking-wider text-white">
            {propertyType}
          </span>
        </div>

        {marketValue != null && (
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="rounded-2xl bg-white/95 px-3 py-2 shadow-xl backdrop-blur-md ring-1 ring-white/40">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                Market Value
              </p>
              <p className="text-base font-black leading-none tracking-tight text-[#16a34a]">
                {formatINR(marketValue)}
              </p>
            </div>

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] shadow-xl shadow-green-500/50 ring-2 ring-white/50 transition-all duration-300 ${
                isSelected
                  ? "scale-100 opacity-100"
                  : "scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100"
              }`}
            >
              <ArrowUpRight className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-green-50">
            <Home className="h-3 w-3 text-[#22C55E]" strokeWidth={2.5} />
          </div>
          <h3 className="text-[15px] font-black text-gray-900 line-clamp-1 tracking-tight leading-tight">
            {address}
          </h3>
        </div>

        <div className="mt-2 flex items-center gap-1.5 pl-7 text-xs text-gray-500">
          <MapPin className="h-3 w-3 flex-shrink-0 text-gray-400" />
          <span className="truncate font-semibold">
            {city}
            {state && `, ${state}`}
            {zipCode && ` ${zipCode}`}
          </span>
        </div>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="flex flex-wrap items-center gap-1.5">
          {area && (
            <div className="flex items-center gap-1 rounded-full bg-gray-50 pl-2 pr-2.5 py-1 ring-1 ring-gray-100">
              <Maximize className="h-3 w-3 text-gray-500" strokeWidth={2.5} />
              <span className="text-[11px] font-bold text-gray-700">
                {area.toLocaleString()} sqft
              </span>
            </div>
          )}

          {bedrooms && (
            <div className="rounded-full bg-green-50 px-2.5 py-1 ring-1 ring-green-100">
              <span className="text-[11px] font-bold text-green-700">
                {bedrooms} BR
              </span>
            </div>
          )}

          {bathrooms && (
            <div className="rounded-full bg-blue-50 px-2.5 py-1 ring-1 ring-blue-100">
              <span className="text-[11px] font-bold text-blue-700">
                {bathrooms} BA
              </span>
            </div>
          )}
        </div>

        {/* ── PENDING → EDIT PROMPT ────────────────────────────────── */}
        {!verified && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
            <p className="text-[11px] font-semibold text-amber-800 leading-tight">
              Missing: {missingFields.slice(0, 2).join(", ")}
              {missingFields.length > 2 && ` +${missingFields.length - 2} more`}
            </p>
            <span
              onClick={handleEditClick}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-amber-600 cursor-pointer"
            >
              <Pencil className="h-3 w-3" />
              Complete to Verify
            </span>
          </div>
        )}
      </div>

      {isSelected && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent" />
      )}
    </button>
  );
}