// frontend/src/components/property/PropertyResultCard.jsx
"use client";

import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  MapPin,
  Maximize,
  ArrowUpRight,
  Home,
  AlertTriangle,
  Pencil,
  Camera,
  ImagePlus,
  ShieldAlert,
  ShieldCheck,
  Shield,
  GitCompare,
} from "lucide-react";
import { formatINR } from "@/utils/currency";
import { getPropertyImage } from "@/constants/propertyImages";
import PropertyImagePlaceholder from "./PropertyImagePlaceholder";

const RISK_CONFIG = {
  LOW: {
    label: "Low risk",
    icon: ShieldCheck,
    className: "bg-green-50 text-green-700 ring-green-200",
  },
  MEDIUM: {
    label: "Medium risk",
    icon: Shield,
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  HIGH: {
    label: "High risk",
    icon: ShieldAlert,
    className: "bg-red-50 text-red-700 ring-red-200",
  },
};

/**
 * PropertyResultCard
 *
 * Props:
 *   property        - property object
 *   isSelected      - highlight state (view details)
 *   onClick         - card click (view details)
 *   onEdit          - opens Edit modal
 *   onQuickPhoto    - opens QuickImageUploadModal
 *   riskScore       - optional RiskScoreResponse
 *   onCompare       - (property) => void — if provided, compare checkbox shows
 *   isInCompare     - bool — whether this property is in compare selection
 *   canAddToCompare - bool — false when 3 already selected
 */
export default function PropertyResultCard({
  property,
  isSelected,
  onClick,
  onEdit,
  onQuickPhoto,
  riskScore,
  onCompare,
  isInCompare = false,
  canAddToCompare = true,
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
    imageUrl,
  } = property;

  const thumbnail     = getPropertyImage(property);
  const passedChecks  = totalChecks - missingFields.length;
  const hasRealImage  = Boolean(imageUrl);
  const riskConfig    = riskScore?.riskLabel
    ? RISK_CONFIG[riskScore.riskLabel] ?? null
    : null;

  const router = useRouter();

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit?.(property);
  };

  const handleQuickPhotoClick = (e) => {
    e.stopPropagation();
    onQuickPhoto?.(property);
  };

  const handleCompareClick = (e) => {
    e.stopPropagation();
    if (!isInCompare && !canAddToCompare) return;
    onCompare?.(property);
  };

  const handleKeyActivate = (fn) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn(e);
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        router.push(`/dashboard/property-search/${property.id}`);
      }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2 ${
        isSelected
          ? "shadow-[0_20px_60px_rgba(34,197,94,0.3)] ring-2 ring-[#22C55E] scale-[1.02]"
          : "shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:ring-gray-200 active:translate-y-0 active:shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
      }`}
    >
      {/* ── IMAGE AREA ───────────────────────────────────────────── */}
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

        {/* ── COMPARE CHECKBOX — top-left when onCompare is wired ── */}
        {onCompare && (
          <div
            role="button"
            tabIndex={0}
            onClick={handleCompareClick}
            onKeyDown={handleKeyActivate(handleCompareClick)}
            title={
              isInCompare
                ? "Remove from comparison"
                : !canAddToCompare
                ? "Maximum 3 properties for comparison"
                : "Add to comparison"
            }
            aria-label={isInCompare ? "Remove from comparison" : "Add to comparison"}
            className={`
              absolute top-3 left-3
              flex h-6 w-6 items-center justify-center
              rounded-md border-2 shadow-lg backdrop-blur-md
              transition-all duration-150 cursor-pointer
              ${isInCompare
                ? "border-[#22C55E] bg-[#22C55E]"
                : !canAddToCompare
                ? "border-gray-300 bg-white/60 cursor-not-allowed opacity-50"
                : "border-white/70 bg-white/30 hover:bg-white/60 hover:border-white opacity-0 group-hover:opacity-100"
              }
            `}
          >
            {isInCompare ? (
              <GitCompare className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            ) : (
              <GitCompare className="h-3.5 w-3.5 text-white" strokeWidth={2} />
            )}
          </div>
        )}

        {/* ── VERIFICATION BADGE ───────────────────────────────────── */}
        {/* Push right when compare checkbox is present */}
        <div className={`absolute top-3 flex items-center gap-1.5 rounded-full bg-white/95 pl-2 pr-3 py-1.5 shadow-xl backdrop-blur-md cursor-help ${onCompare ? "left-11" : "left-3"} ${verified ? "ring-1 ring-white/40" : "ring-1 ring-amber-200"}`}
          title={
            verified
              ? `Verified — all ${totalChecks} data quality checks passed`
              : `Pending — ${passedChecks} of ${totalChecks} checks passed.\nMissing: ${missingFields.join(", ")}`
          }
        >
          {verified ? (
            <>
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a]">
                <BadgeCheck className="h-3 w-3 text-white" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-900">
                Verified
              </span>
            </>
          ) : (
            <>
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-300">
                <AlertTriangle className="h-2.5 w-2.5 text-white" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-700">
                Incomplete · {passedChecks}/{totalChecks}
              </span>
            </>
          )}
        </div>

        {/* ── TOP-RIGHT: change photo + property type ──────────────── */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {hasRealImage && onQuickPhoto && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleQuickPhotoClick}
              onKeyDown={handleKeyActivate(handleQuickPhotoClick)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-lg ring-1 ring-white/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110 cursor-pointer"
              title="Change photo"
              aria-label="Change photo"
            >
              <Camera className="h-3.5 w-3.5 text-gray-700" strokeWidth={2.5} />
            </div>
          )}
          <div className="rounded-full bg-gradient-to-r from-[#22C55E] to-[#16a34a] px-3 py-1.5 shadow-xl shadow-green-500/50 ring-1 ring-white/30">
            <span className="text-[10px] font-black uppercase tracking-wider text-white">
              {propertyType}
            </span>
          </div>
        </div>

        {/* ── ADD PHOTO pill ────────────────────────────────────────── */}
        {!hasRealImage && onQuickPhoto && (
          <div
            role="button"
            tabIndex={0}
            onClick={handleQuickPhotoClick}
            onKeyDown={handleKeyActivate(handleQuickPhotoClick)}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 shadow-xl backdrop-blur-md ring-1 ring-white/40 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer"
            title="Add photo"
            aria-label="Add photo"
          >
            <ImagePlus className="h-4 w-4 text-[#16a34a]" strokeWidth={2.5} />
            <span className="text-xs font-black uppercase tracking-wider text-gray-900">
              Add photo
            </span>
          </div>
        )}

        {/* ── MARKET VALUE STRIP ───────────────────────────────────── */}
        {marketValue != null && (
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
            <div className="rounded-2xl bg-white/95 px-3 py-2 shadow-xl backdrop-blur-md ring-1 ring-white/40">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                Market value
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

      {/* ── CARD BODY ────────────────────────────────────────────── */}
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
            {city}{state && `, ${state}`}{zipCode && ` ${zipCode}`}
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
              <span className="text-[11px] font-bold text-green-700">{bedrooms} BR</span>
            </div>
          )}
          {bathrooms && (
            <div className="rounded-full bg-blue-50 px-2.5 py-1 ring-1 ring-blue-100">
              <span className="text-[11px] font-bold text-blue-700">{bathrooms} BA</span>
            </div>
          )}
          {riskConfig && (
            <div
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 ring-1 ${riskConfig.className}`}
              title={`Risk score: ${riskScore.overallScore}/100`}
            >
              <riskConfig.icon className="h-3 w-3" strokeWidth={2.5} />
              <span className="text-[11px] font-bold">{riskConfig.label}</span>
            </div>
          )}
        </div>

        {!verified && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
            <p className="text-[11px] font-semibold text-amber-800 leading-tight">
              Missing: {missingFields.slice(0, 2).join(", ")}
              {missingFields.length > 2 && ` +${missingFields.length - 2} more`}
            </p>
            <span
              role="button"
              tabIndex={0}
              onClick={handleEditClick}
              onKeyDown={handleKeyActivate(handleEditClick)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-amber-600 cursor-pointer"
            >
              <Pencil className="h-3 w-3" />
              Complete to verify
            </span>
          </div>
        )}
      </div>

      {isSelected && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent" />
      )}

      {/* Compare selection ring */}
      {isInCompare && (
        <div className="absolute inset-0 rounded-3xl ring-2 ring-[#22C55E] pointer-events-none" />
      )}
    </button>
  );
}