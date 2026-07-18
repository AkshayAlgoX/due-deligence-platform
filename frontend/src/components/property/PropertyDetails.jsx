"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Ruler,
  MapPinned,
  Calendar,
  Home,
  FileText,
  ArrowRight,
} from "lucide-react";
import { formatINRFull } from "@/utils/currency";
import { getPropertyHeroImage } from "@/constants/propertyImages";
import PropertyImagePlaceholder from "./PropertyImagePlaceholder";

/**
 * Big hero-style property card matching the Figma design.
 */
export default function PropertyDetails({ property, onCompare }) {
  const router = useRouter();

  if (!property) return null;

  const {
    id,
    address = "Unknown Address",
    city = "",
    state = "",
    zipCode = "",
    propertyType = "Property",
    marketValue,
    area,
    lotSize = "0.45 Acres",
    yearBuilt = "1994",
    zoning = "R-1",
    verified = true,
  } = property;

  const locationLine = [city, state].filter(Boolean).join(", ");
  const fullAddress = `${address}${locationLine ? `, ${locationLine}` : ""}${zipCode ? ` ${zipCode}` : ""}`;

  const handleGenerateReport = () => {
    if (id) {
      router.push(`/property/${id}/report`);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT: Property Image */}
        <div className="relative min-h-[380px]">
         {getPropertyHeroImage(property) ? (
  <img
    src={getPropertyHeroImage(property)}
    alt={address}
    className="absolute inset-0 h-full w-full object-cover"
  />
) : (
  <PropertyImagePlaceholder propertyType={propertyType} size="hero" />
)}

          {verified && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
              <BadgeCheck className="h-4 w-4 text-[#22C55E]" strokeWidth={2.5} />
              <span className="text-xs font-bold text-gray-800">
                Verified Property
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: Details */}
        <div className="flex flex-col p-8">

          <p className="text-xs font-bold uppercase tracking-widest text-[#22C55E]">
            {propertyType}
          </p>

          <div className="mt-3 flex items-start justify-between gap-6">
            <h2 className="text-[26px] font-black leading-[30px] tracking-tight text-gray-900">
              {fullAddress}
            </h2>

            {marketValue != null && (
              <div className="flex-shrink-0 text-right">
                <p className="text-[30px] font-black leading-none tracking-tight text-gray-900">
                  {formatINRFull(marketValue)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Estimated Market Value
                </p>
              </div>
            )}
          </div>

          <div className="my-6 h-px bg-gray-100" />

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">

            <div>
              <Ruler className="h-4 w-4 text-gray-400" />
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Square Footage
              </p>
              <p className="mt-1 text-base font-bold text-gray-900">
                {area ? `${area.toLocaleString()} sqft` : "N/A"}
              </p>
            </div>

            <div>
              <MapPinned className="h-4 w-4 text-gray-400" />
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Lot Size
              </p>
              <p className="mt-1 text-base font-bold text-gray-900">
                {lotSize}
              </p>
            </div>

            <div>
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Year Built
              </p>
              <p className="mt-1 text-base font-bold text-gray-900">
                {yearBuilt}
              </p>
            </div>

            <div>
              <Home className="h-4 w-4 text-gray-400" />
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Zoning
              </p>
              <p className="mt-1 text-base font-bold text-gray-900">
                {zoning}
              </p>
            </div>

          </div>

          <div className="my-6 h-px bg-gray-100" />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onCompare}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              Compare Property
            </button>

            <button
              type="button"
              onClick={handleGenerateReport}
              className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition hover:bg-[#16a34a]"
            >
              <FileText className="h-4 w-4" />
              Generate Due Diligence Report
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}