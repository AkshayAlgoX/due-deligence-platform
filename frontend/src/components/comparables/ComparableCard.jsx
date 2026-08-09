"use client";

import { useTranslation } from "react-i18next";
import { MapPin, Bed, Bath, Ruler } from "lucide-react";
import { formatINR } from "@/utils/currency";
import SimilarityBadge from "./SimilarityBadge";
import BetterDealIndicator from "./BetterDealIndicator";

/** Individual comparable-property card, used in the comparables grid/list. */
export default function ComparableCard({ comparable, subjectPricePerSqft }) {
  const { t } = useTranslation();
  if (!comparable) return null;

  const {
    address,
    city,
    marketValue,
    area,
    bedrooms,
    bathrooms,
    similarityScore,
    similarityLevel,
    distanceKm,
    pricePerSqft,
  } = comparable;

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-sm transition hover:border-[#22C55E] hover:shadow-[0_8px_24px_rgba(34,197,94,0.12)]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <SimilarityBadge level={similarityLevel} score={similarityScore} />
        {distanceKm != null && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-[#7d8590]">
            <MapPin className="h-3 w-3" strokeWidth={2} />
            {t("comparable.distanceKm", { km: distanceKm.toFixed(1) })}
          </span>
        )}
      </div>

      <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3] leading-tight line-clamp-2">
        {address}
      </p>
      <p className="text-xs text-gray-500 dark:text-[#7d8590] mt-0.5">{city}</p>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-lg font-black text-gray-900 dark:text-[#e6edf3]">
          {marketValue != null ? formatINR(marketValue) : "—"}
        </p>
        <BetterDealIndicator
          comparablePricePerSqft={pricePerSqft}
          subjectPricePerSqft={subjectPricePerSqft}
        />
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-[#7d8590]">
        {bedrooms != null && (
          <span className="inline-flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" strokeWidth={2} />
            {bedrooms}
          </span>
        )}
        {bathrooms != null && (
          <span className="inline-flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" strokeWidth={2} />
            {bathrooms}
          </span>
        )}
        {area != null && (
          <span className="inline-flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5" strokeWidth={2} />
            {area.toLocaleString()} {t("property.details.sqft")}
          </span>
        )}
      </div>

      {pricePerSqft != null && (
        <p className="mt-2 text-[11px] font-semibold text-gray-400 dark:text-[#6e7681]">
          {t("comparable.pricePerSqft")}: ₹{pricePerSqft.toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}
