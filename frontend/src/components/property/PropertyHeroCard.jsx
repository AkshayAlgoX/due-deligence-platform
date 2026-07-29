"use client";

import { BadgeCheck, AlertTriangle, MapPin, Home, Maximize2, ImageIcon } from "lucide-react";
import { formatINR } from "@/utils/currency";

const LABELS = ["A", "B", "C"];
const LABEL_COLORS = [
  "from-[#22C55E] to-[#16a34a] shadow-green-400/40",
  "from-blue-500 to-blue-600 shadow-blue-400/40",
  "from-purple-500 to-purple-600 shadow-purple-400/40",
];

// Light gradient placeholders — dimmed via dark:brightness-75 in body
const GRADIENT_PLACEHOLDERS = [
  "from-green-100 via-emerald-50 to-teal-50",
  "from-blue-100 via-sky-50 to-cyan-50",
  "from-purple-100 via-violet-50 to-fuchsia-50",
];

export default function PropertyHeroCard({ property, index = 0, totalCount = 2 }) {
  const imageHeight = totalCount === 3 ? "h-32" : "h-44";
  const showCompactStats = totalCount === 3;

  if (!property) {
    return (
      <div className="flex-1 min-w-[280px] rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm overflow-hidden animate-pulse">
        <div className={`${imageHeight} bg-gray-100 dark:bg-[#1c2128]`} />
        <div className="p-5 space-y-3">
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-[#30363d]" />
          <div className="h-3 w-24 rounded bg-gray-100 dark:bg-[#1c2128]" />
          <div className="h-8 w-28 rounded bg-gray-100 dark:bg-[#1c2128] mt-2" />
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-gray-50 dark:bg-[#1c2128]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pricePerSqft =
    property.marketValue && property.area
      ? Math.round(property.marketValue / property.area)
      : null;

  return (
    <div className="flex-1 min-w-[280px] rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm hover:shadow-md dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:border-green-200 dark:hover:border-green-900 transition-all overflow-hidden group">
      {/* HERO IMAGE */}
      <div className={`relative ${imageHeight} overflow-hidden`}>
        {property.imageUrl ? (
          <>
            <img
              src={property.imageUrl}
              alt={property.address}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <div className={`hidden absolute inset-0 bg-gradient-to-br ${GRADIENT_PLACEHOLDERS[index]} dark:brightness-75 flex items-center justify-center`}>
              <ImageIcon className="h-10 w-10 text-white/60" strokeWidth={1.5} />
            </div>
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_PLACEHOLDERS[index]} dark:brightness-75 flex items-center justify-center`}>
            <ImageIcon className="h-10 w-10 text-gray-300 dark:text-gray-500" strokeWidth={1.5} />
          </div>
        )}

        {/* Index label — stays gradient (brand) */}
        <div className="absolute top-3 left-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${LABEL_COLORS[index]} shadow-lg ring-2 ring-white dark:ring-[#161b22]`}
          >
            <span className="text-sm font-black text-white">{LABELS[index]}</span>
          </div>
        </div>

        {/* Verified badge — stays white pill on image */}
        <div className="absolute top-3 right-3">
          {property.verified ? (
            <div className="flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 ring-1 ring-green-200 shadow-sm">
              <BadgeCheck className="h-3 w-3 text-green-600" strokeWidth={2.5} />
              <span className="text-[9px] font-black text-green-700">Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 ring-1 ring-amber-200 shadow-sm">
              <AlertTriangle className="h-3 w-3 text-amber-500" strokeWidth={2.5} />
              <span className="text-[9px] font-black text-amber-700">Pending</span>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

        {property.propertyType && (
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#16a34a] shadow-sm">
              {property.propertyType}
            </span>
          </div>
        )}
      </div>

      {/* CARD BODY */}
      <div className={showCompactStats ? "p-4" : "p-5"}>
        <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3] line-clamp-1 leading-tight">
          {property.address}
        </p>
        <p className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-400 dark:text-[#7d8590] font-medium">
          <MapPin className="h-3 w-3 flex-shrink-0" strokeWidth={2} />
          {property.city}
          {property.state ? `, ${property.state}` : ""}
        </p>

        <div className={showCompactStats ? "mt-3" : "mt-4"}>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-0.5">
            Market value
          </p>
          <p className={`font-black text-gray-900 dark:text-[#e6edf3] tracking-tight ${showCompactStats ? "text-xl" : "text-2xl"}`}>
            {property.marketValue ? formatINR(property.marketValue) : "—"}
          </p>
          {pricePerSqft && (
            <p className="text-[11px] text-gray-400 dark:text-[#6e7681] font-semibold mt-0.5">
              ₹{pricePerSqft.toLocaleString("en-IN")}/sqft
            </p>
          )}
        </div>

        <div className={`grid grid-cols-2 gap-2 ${showCompactStats ? "mt-3" : "mt-4"}`}>
          <StatPill
            label="Type"
            value={property.propertyType ?? "—"}
            icon={<Home className="h-3 w-3" strokeWidth={2} />}
            compact={showCompactStats}
          />
          <StatPill
            label="Area"
            value={property.area ? `${property.area.toLocaleString()} sqft` : "—"}
            icon={<Maximize2 className="h-3 w-3" strokeWidth={2} />}
            compact={showCompactStats}
          />
          <StatPill
            label="Bedrooms"
            value={property.bedrooms ?? "—"}
            compact={showCompactStats}
          />
          <StatPill
            label="Year built"
            value={property.yearBuilt ?? "—"}
            compact={showCompactStats}
          />
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, icon, compact = false }) {
  return (
    <div className={`rounded-xl bg-gray-50 dark:bg-[#1c2128] ring-1 ring-gray-100 dark:ring-[#30363d] ${compact ? "px-2.5 py-2" : "px-3 py-2.5"}`}>
      <div className="flex items-center gap-1 mb-0.5">
        {icon && <span className="text-gray-400 dark:text-[#7d8590]">{icon}</span>}
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
          {label}
        </p>
      </div>
      <p className="text-xs font-black text-gray-800 dark:text-[#e6edf3] truncate">{value}</p>
    </div>
  );
}