"use client";
import { translatePropertyType } from "@/utils/enumTranslations";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
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
  ShieldX,
  GitCompare,
} from "lucide-react";
import { formatINR } from "@/utils/currency";
import { getPropertyImage } from "@/constants/propertyImages";
import PropertyImagePlaceholder from "./PropertyImagePlaceholder";
import { usePropertyLabels } from "@/hooks/usePropertyLabels";
import PropertyLabel from "./PropertyLabel";

// Risk config — supports all 4 levels (LOW/MEDIUM/HIGH/CRITICAL)
// Translation keys are stored, not raw labels.
const RISK_CONFIG = {
  LOW: {
    labelKey: "property.card.lowRisk",
    icon: ShieldCheck,
    className:
      "bg-green-50 dark:bg-[#0d2818] text-green-700 dark:text-green-400 ring-green-200 dark:ring-green-900 hover:bg-green-100 dark:hover:bg-[#0d2818]/80",
  },
  MEDIUM: {
    labelKey: "property.card.mediumRisk",
    icon: Shield,
    className:
      "bg-amber-50 dark:bg-[#282a10] text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-900 hover:bg-amber-100 dark:hover:bg-[#282a10]/80",
  },
  HIGH: {
    labelKey: "property.card.highRisk",
    icon: ShieldAlert,
    className:
      "bg-orange-50 dark:bg-[#2d1e10] text-orange-700 dark:text-orange-400 ring-orange-200 dark:ring-orange-900 hover:bg-orange-100 dark:hover:bg-[#2d1e10]/80",
  },
  CRITICAL: {
    labelKey: "property.card.criticalRisk",
    icon: ShieldX,
    className:
      "bg-red-50 dark:bg-[#2d1214] text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-900 hover:bg-red-100 dark:hover:bg-[#2d1214]/80",
  },
};

/**
 * Normalizes risk data from either the old or new API shape.
 *   Old: { riskLabel: "LOW" | "MEDIUM" | "HIGH", overallScore: number }
 *   New: { overallLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL", overallScore: number }
 */
function normalizeRisk(riskScore) {
  if (!riskScore) return null;
  const level = riskScore.overallLevel || riskScore.riskLabel;
  const score = riskScore.overallScore;
  if (!level) return null;
  return { level: String(level).toUpperCase(), score };
}

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
  const { t } = useTranslation();
  const router = useRouter();

  // ── Labels ────────────────────────────────────────────────────────
  const { labels } = usePropertyLabels(property?.id ?? null);

  if (!property) return null;

  const {
    address = t("property.card.unknownAddress"),
    city = "",
    state = "",
    zipCode = "",
    propertyType = t("property.card.propertyFallback"),
    marketValue,
    area,
    bedrooms,
    bathrooms,
    verified,
    missingFields = [],
    totalChecks = 7,
    imageUrl,
  } = property;

  const thumbnail = getPropertyImage(property);
  const passedChecks = totalChecks - missingFields.length;
  const hasRealImage = Boolean(imageUrl);

  // Normalize risk (supports old + new API shapes)
  const risk = normalizeRisk(riskScore);
  const riskConfig = risk ? RISK_CONFIG[risk.level] ?? null : null;

  const goToDetails = () => {
    onClick?.();
    router.push(`/dashboard/property-search/${property.id}`);
  };

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

  // NEW: Click risk badge → jump straight to Risk Analysis page
  const handleRiskBadgeClick = (e) => {
    e.stopPropagation();
    router.push(`/properties/${property.id}/risk-analysis`);
  };

  const handleKeyActivate = (fn) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      fn(e);
    }
  };

  const handleCardKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToDetails();
    }
  };

  // Pre-compute tooltips
  const compareTooltip = isInCompare
    ? t("property.card.removeFromCompare")
    : !canAddToCompare
    ? t("property.card.maxCompareReached")
    : t("property.card.addToCompare");

  const compareAriaLabel = isInCompare
    ? t("property.card.removeFromCompare")
    : t("property.card.addToCompare");

  const verificationTooltip = verified
    ? t("property.card.verifiedTooltip", { n: totalChecks })
    : t("property.card.pendingTooltip", {
        passed: passedChecks,
        total: totalChecks,
        missing: missingFields.join(", "),
      });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={handleCardKeyDown}
      className={`group relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#161b22] text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2 ${
        isSelected
          ? "scale-[1.02] shadow-[0_20px_60px_rgba(34,197,94,0.3)] ring-2 ring-[#22C55E]"
          : "shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-gray-100 dark:ring-[#30363d] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:ring-gray-200 dark:hover:ring-[#484f58] active:translate-y-0 active:shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
      }`}
    >
      {/* IMAGE AREA */}
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

        {/* COMPARE */}
        {onCompare && (
          <div
            role="button"
            tabIndex={0}
            onClick={handleCompareClick}
            onKeyDown={handleKeyActivate(handleCompareClick)}
            title={compareTooltip}
            aria-label={compareAriaLabel}
            className={`
              absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-md border-2 shadow-lg backdrop-blur-md transition-all duration-150
              ${
                isInCompare
                  ? "pointer-events-auto border-[#22C55E] bg-[#22C55E] opacity-100 cursor-pointer"
                  : !canAddToCompare
                  ? "pointer-events-none border-gray-300 bg-white/60 cursor-not-allowed opacity-50"
                  : "pointer-events-none border-white/70 bg-white/30 opacity-0 cursor-pointer hover:border-white hover:bg-white/60 group-hover:pointer-events-auto group-hover:opacity-100"
              }
            `}
          >
            <GitCompare
              className="h-3.5 w-3.5 text-white"
              strokeWidth={isInCompare ? 3 : 2}
            />
          </div>
        )}

        {/* VERIFICATION BADGE */}
        <div
          className={`absolute top-3 flex cursor-help items-center gap-1.5 rounded-full py-1.5 pl-2 pr-3 shadow-xl backdrop-blur-md ${
            onCompare ? "left-11" : "left-3"
          } ${
            verified
              ? "bg-white/95 ring-1 ring-white/40"
              : "bg-amber-50 dark:bg-[#3a2a10]/95 ring-1 ring-amber-200 dark:ring-amber-800/60"
          }`}
          title={verificationTooltip}
        >
          {verified ? (
            <>
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a]">
                <BadgeCheck className="h-3 w-3 text-white" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-900">
                {t("property.card.verified")}
              </span>
            </>
          ) : (
            <>
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-300">
                <AlertTriangle
                  className="h-2.5 w-2.5 text-white"
                  strokeWidth={3}
                />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                {t("property.card.incomplete")} · {passedChecks}/{totalChecks}
              </span>
            </>
          )}
        </div>

        {/* TOP RIGHT — PROPERTY TYPE + CAMERA */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {hasRealImage && onQuickPhoto && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleQuickPhotoClick}
              onKeyDown={handleKeyActivate(handleQuickPhotoClick)}
              className="pointer-events-none flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/95 opacity-0 shadow-lg ring-1 ring-white/40 backdrop-blur-md transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 hover:scale-110 hover:bg-white"
              title={t("property.card.changePhoto")}
              aria-label={t("property.card.changePhoto")}
            >
              <Camera className="h-3.5 w-3.5 text-gray-700" strokeWidth={2.5} />
            </div>
          )}

          <div className="rounded-full bg-gradient-to-r from-[#22C55E] to-[#16a34a] px-3 py-1.5 shadow-xl shadow-green-500/50 ring-1 ring-white/30">
            <span className="text-[10px] font-black uppercase tracking-wider text-white">
              {translatePropertyType(t, propertyType)}
            </span>
          </div>
        </div>

        {/* ADD PHOTO */}
        {!hasRealImage && onQuickPhoto && (
          <div
            role="button"
            tabIndex={0}
            onClick={handleQuickPhotoClick}
            onKeyDown={handleKeyActivate(handleQuickPhotoClick)}
            className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-2 rounded-xl bg-white/95 dark:bg-[#22C55E]/95 px-4 py-2 opacity-0 shadow-xl ring-1 ring-white/40 dark:ring-white/20 backdrop-blur-md transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100 hover:scale-105"
            title={t("property.card.addPhoto")}
            aria-label={t("property.card.addPhoto")}
          >
            <ImagePlus
              className="h-4 w-4 text-[#16a34a] dark:text-white"
              strokeWidth={2.5}
            />
            <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              {t("property.card.addPhoto")}
            </span>
          </div>
        )}

        {/* MARKET VALUE */}
        {marketValue != null && (
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="rounded-2xl bg-white/95 px-3 py-2 shadow-xl ring-1 ring-white/40 backdrop-blur-md">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                {t("property.card.marketValue")}
              </p>
              <p className="text-base font-black leading-none tracking-tight text-[#16a34a]">
                {formatINR(marketValue)}
              </p>
            </div>

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] shadow-xl shadow-green-500/50 ring-2 ring-white/50 transition-all duration-300 ${
                isSelected
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-75 opacity-0 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100"
              }`}
            >
              <ArrowUpRight className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
        )}
      </div>

      {/* CARD BODY */}
      <div className="flex flex-1 min-h-0 flex-col p-5">
        {/* Labels row — Zillow style, above address */}
        {labels && labels.length > 0 && (
          <div
            className="mb-3 flex flex-wrap items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {labels.slice(0, 3).map((label) => (
              <PropertyLabel
                key={label.id ?? label.type}
                type={label.type}
                size="sm"
              />
            ))}
            {labels.length > 3 && (
              <div className="rounded-full bg-gray-100 dark:bg-[#1c2128] px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:text-[#7d8590] ring-1 ring-gray-200 dark:ring-[#30363d]">
                +{labels.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-green-50 dark:bg-[#0d2818]">
            <Home className="h-3 w-3 text-[#22C55E]" strokeWidth={2.5} />
          </div>
          <h3 className="line-clamp-1 text-[15px] font-black leading-tight tracking-tight text-gray-900 dark:text-[#e6edf3]">
            {address}
          </h3>
        </div>
        <div className="mt-2 flex items-center gap-1.5 pl-7 text-xs text-gray-500 dark:text-[#7d8590]">
          <MapPin className="h-3 w-3 flex-shrink-0 text-gray-400 dark:text-[#6e7681]" />
          <span className="truncate font-semibold">
            {city}
            {state && `, ${state}`}
            {zipCode && ` ${zipCode}`}
          </span>
        </div>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-[#30363d] to-transparent" />

        <div className="flex flex-wrap items-center gap-1.5">
          {area && (
            <div className="flex items-center gap-1 rounded-full bg-gray-50 dark:bg-[#1c2128] py-1 pl-2 pr-2.5 ring-1 ring-gray-100 dark:ring-[#30363d]">
              <Maximize
                className="h-3 w-3 text-gray-500 dark:text-[#7d8590]"
                strokeWidth={2.5}
              />
              <span className="text-[11px] font-bold text-gray-700 dark:text-[#e6edf3]">
                {area.toLocaleString()} {t("property.details.sqft")}
              </span>
            </div>
          )}

          {bedrooms && (
            <div className="rounded-full bg-green-50 dark:bg-[#0d2818] px-2.5 py-1 ring-1 ring-green-100 dark:ring-green-900">
              <span className="text-[11px] font-bold text-green-700 dark:text-green-400">
                {t("property.card.bedroomsShort", { n: bedrooms })}
              </span>
            </div>
          )}

          {bathrooms && (
            <div className="rounded-full bg-blue-50 dark:bg-[#0c1f33] px-2.5 py-1 ring-1 ring-blue-100 dark:ring-blue-900">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">
                {t("property.card.bathroomsShort", { n: bathrooms })}
              </span>
            </div>
          )}

                    {/* RISK BADGE — clickable → jumps to full risk analysis */}
          {riskConfig && risk && (
            <button
              type="button"
              onClick={handleRiskBadgeClick}
              onKeyDown={handleKeyActivate(handleRiskBadgeClick)}
              className={`group/risk flex items-center gap-1 rounded-full px-2.5 py-1 ring-1 transition-all duration-200 cursor-pointer ${riskConfig.className}`}
              title={
                risk.score != null
                  ? t("property.card.riskScoreTooltipFull", {
                      defaultValue:
                        "Risk: {{level}} ({{score}}/100) — click for full analysis",
                      level: t(riskConfig.labelKey),
                      score: Math.round(risk.score),
                    })
                  : t("property.card.riskScoreClickTooltip", {
                      defaultValue: "Click for full risk analysis",
                    })
              }
              aria-label={t("property.card.riskBadgeAria", {
                defaultValue: "View full risk analysis: {{level}}",
                level: t(riskConfig.labelKey),
              })}
            >
              <riskConfig.icon className="h-3 w-3" strokeWidth={2.5} />
              <span className="text-[11px] font-bold">
                {t(riskConfig.labelKey)}
              </span>
              {risk.score != null && (
                <span className="text-[10px] font-bold tabular-nums opacity-75">
                  · {Math.round(risk.score)}
                </span>
              )}
              <ArrowUpRight
                className="h-2.5 w-2.5 opacity-40 transition-all duration-200 group-hover/risk:opacity-100 group-hover/risk:translate-x-px group-hover/risk:-translate-y-px"
                strokeWidth={2.5}
              />
            </button>
          )}
        </div>

        <div className="mt-auto pt-4">
          {!verified ? (
            <div className="min-h-[76px] rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-[#282a10] p-3">
              <p className="text-[11px] font-semibold leading-tight text-amber-800 dark:text-amber-300">
                {t("property.card.missing")}{" "}
                {missingFields.slice(0, 2).join(", ")}
                {missingFields.length > 2 &&
                  ` ${t("property.card.moreItems", {
                    n: missingFields.length - 2,
                  })}`}
              </p>
              <span
                role="button"
                tabIndex={0}
                onClick={handleEditClick}
                onKeyDown={handleKeyActivate(handleEditClick)}
                className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-amber-600"
              >
                <Pencil className="h-3 w-3" />
                {t("property.card.completeToVerify")}
              </span>
            </div>
          ) : (
            <div className="min-h-[76px] " />
          )}
        </div>
      </div>

      {isSelected && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent" />
      )}

      {isInCompare && (
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-[#22C55E]" />
      )}
    </div>
  );
}