"use client";

import { BadgeCheck, MapPin, Maximize, ArrowUpRight, Home } from "lucide-react";
import { formatINR } from "@/utils/currency";

export default function PropertyResultCard({ property, isSelected, onClick }) {
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
    bedrooms,
    bathrooms,
  } = property;

  const thumbnails = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  ];
  const thumbnail = thumbnails[(id - 1) % thumbnails.length];

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
        <img
          src={thumbnail}
          alt={address}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 pl-2 pr-3 py-1.5 shadow-xl backdrop-blur-md ring-1 ring-white/40">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a]">
            <BadgeCheck className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-900">
            Verified
          </span>
        </div>

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
      </div>

      {isSelected && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent" />
      )}
    </button>
  );
}