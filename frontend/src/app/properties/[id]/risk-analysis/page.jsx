"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Bed,
  Building2,
  ChevronRight,
  FileText,
  Info,
  Loader2,
  MapPin,
  Maximize2,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import api from "@/services/api";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useRiskAssessment } from "@/hooks/useRiskAssessment";
import { formatINR } from "@/utils/currency";
import { getPropertyImage } from "@/constants/propertyImages";
import { formatScore, getRiskLevelMeta } from "@/utils/riskUtils";

import PropertyImagePlaceholder from "@/components/property/PropertyImagePlaceholder";
import RiskBreakdownRadar from "@/components/risk/RiskBreakdownRadar";
import RiskExplainability from "@/components/risk/RiskExplainability";
import RiskFactorCard from "@/components/risk/RiskFactorCard";
import RiskHistorySection from "@/components/risk/RiskHistorySection";
import RiskSpectrum from "@/components/risk/RiskSpectrum";

// Category color tokens (used across radar, contributors, factors)
const CATEGORY_COLORS = {
  FLOOD:         { solid: "#3B82F6", bg: "bg-blue-500/15 dark:bg-blue-500/15",     border: "border-blue-400/30",    text: "text-blue-600 dark:text-blue-400" },
  LEGAL:         { solid: "#A855F7", bg: "bg-purple-500/15 dark:bg-purple-500/15", border: "border-purple-400/30",  text: "text-purple-600 dark:text-purple-400" },
  TAX:           { solid: "#F59E0B", bg: "bg-amber-500/15 dark:bg-amber-500/15",   border: "border-amber-400/30",   text: "text-amber-600 dark:text-amber-400" },
  ZONING:        { solid: "#6366F1", bg: "bg-indigo-500/15 dark:bg-indigo-500/15", border: "border-indigo-400/30",  text: "text-indigo-600 dark:text-indigo-400" },
  ENVIRONMENTAL: { solid: "#22C55E", bg: "bg-green-500/15 dark:bg-green-500/15",   border: "border-green-400/30",   text: "text-green-600 dark:text-green-400" },
  MARKET:        { solid: "#F43F5E", bg: "bg-rose-500/15 dark:bg-rose-500/15",     border: "border-rose-400/30",    text: "text-rose-600 dark:text-rose-400" },
};

export default function RiskAnalysisPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id;

  const {
    breakdown,
    history,
    loading,
    error,
    recalculating,
    recalculate,
  } = useRiskAssessment(propertyId, {
    autoFetch: true,
    loadHistory: true,
  });

  const [propertyInfo, setPropertyInfo] = useState(null);
  const [showMethodology, setShowMethodology] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(API_ROUTES.PROPERTY_BY_ID(propertyId));
        if (!cancelled) setPropertyInfo(res.data);
      } catch (err) {
        console.warn("Failed to load property info:", err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  // ── Loading ──
  if (loading && !breakdown) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-[#7d8590]" />
          <p className="text-sm text-gray-500 dark:text-[#7d8590]">
            {t("risk.page.loading", "Analyzing property risk…")}
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error && !breakdown) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle
            className="w-10 h-10 text-gray-400 mx-auto mb-4"
            strokeWidth={1.5}
          />
          <h1 className="text-base font-semibold text-gray-900 dark:text-[#e6edf3] mb-2">
            {t("risk.page.errorTitle", "Unable to load risk analysis")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#7d8590] mb-6">
            {error}
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-[#30363d] text-sm font-medium text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#161b22]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("risk.page.goBack", "Go back")}
          </button>
        </div>
      </div>
    );
  }

  if (!breakdown) return null;

  const propertyThumbnail = propertyInfo ? getPropertyImage(propertyInfo) : null;

  // Data source availability
  const totalSources = 6;
  const unavailableCount = breakdown.unavailableProviderCount || 0;
  const availableSources = Math.max(0, totalSources - unavailableCount);

  // Last calculated timestamp
  const lastCalculatedAt =
    breakdown.calculatedAt ||
    breakdown.updatedAt ||
    (history?.history?.[history.history.length - 1]?.calculatedAt);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">
      {/* ════════════════════════════════════════════════════════
          BREADCRUMB
      ════════════════════════════════════════════════════════ */}
      <div className="border-b border-gray-200 dark:border-[#30363d]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2 text-sm">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-gray-500 dark:text-[#7d8590] hover:text-gray-900 dark:hover:text-[#e6edf3] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            {t("risk.page.backToProperty", "Back to property")}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-[#484f58]" />
          <span className="text-gray-900 dark:text-[#e6edf3] font-medium">
            {t("risk.page.title", "Risk Analysis")}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ════════════════════════════════════════════════════════
            PROPERTY HERO CARD
        ════════════════════════════════════════════════════════ */}
        {propertyInfo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm overflow-hidden"
          >
            <div className="p-5 flex flex-col sm:flex-row gap-5">
              {/* Photo */}
              <div className="w-full sm:w-36 h-36 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] ring-1 ring-black/5 dark:ring-white/5">
                {propertyThumbnail ? (
                  <img
                    src={propertyThumbnail}
                    alt={propertyInfo.address}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PropertyImagePlaceholder
                    propertyType={propertyInfo.propertyType}
                  />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight leading-tight">
                    {propertyInfo.address}
                  </h1>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[#7d8590] mt-1">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                    <span className="truncate">
                      {propertyInfo.city}
                      {propertyInfo.state && `, ${propertyInfo.state}`}
                      {propertyInfo.zipCode && ` ${propertyInfo.zipCode}`}
                    </span>
                  </div>
                </div>

                {/* Metadata pills with filled icon tiles */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {propertyInfo.marketValue != null && (
                    <MetaPill
                      icon={IndianRupee}
                      iconBg="bg-green-500/15"
                      iconColor="text-green-600 dark:text-green-400"
                      value={formatINR(propertyInfo.marketValue)}
                    />
                  )}
                  {propertyInfo.area && (
                    <MetaPill
                      icon={Maximize2}
                      iconBg="bg-blue-500/15"
                      iconColor="text-blue-600 dark:text-blue-400"
                      value={`${propertyInfo.area.toLocaleString()} ${t("property.details.sqft", "sqft")}`}
                    />
                  )}
                  {propertyInfo.bedrooms && (
                    <MetaPill
                      icon={Bed}
                      iconBg="bg-purple-500/15"
                      iconColor="text-purple-600 dark:text-purple-400"
                      value={`${propertyInfo.bedrooms} ${t("risk.page.bedShort", "BR")}`}
                    />
                  )}
                  {propertyInfo.propertyType && (
                    <MetaPill
                      icon={Building2}
                      iconBg="bg-amber-500/15"
                      iconColor="text-amber-600 dark:text-amber-400"
                      value={propertyInfo.propertyType}
                    />
                  )}
                </div>
              </div>

              {/* Generate Report CTA */}
              <div className="flex sm:items-center">
                <Link
                  href={`/properties/${propertyId}/generate-report`}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] transition-all hover:scale-[1.03] hover:shadow-[0_15px_40px_rgba(34,197,94,0.5)] active:scale-[0.97] flex-shrink-0"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  <FileText className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                  <span className="relative z-10">
                    {t("risk.page.generateReport", "Generate Report")}
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════
            SCORE HERO CARD
        ════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-200 dark:border-[#30363d] p-6 lg:p-8 mb-6 bg-white dark:bg-[#161b22] shadow-sm"
        >
          <RiskSpectrum
            score={breakdown.overallScore}
            level={breakdown.overallLevel}
            onRecalculate={recalculate}
            recalculating={recalculating}
            lastCalculatedAt={lastCalculatedAt}
            availableSources={availableSources}
            totalSources={totalSources}
          />
        </motion.div>

        {/* ════════════════════════════════════════════════════════
            DATA QUALITY WARNING
        ════════════════════════════════════════════════════════ */}
        {breakdown.dataIncomplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle
                className="w-4 h-4 text-amber-600 dark:text-amber-400"
                strokeWidth={2.25}
              />
            </div>
            <div className="text-amber-900 dark:text-amber-200 pt-0.5">
              <span className="font-semibold">
                {t(
                  "risk.page.dataWarningTitle",
                  "Some data sources are unavailable"
                )}
                .
              </span>{" "}
              <span className="text-amber-800 dark:text-amber-300">
                {t(
                  "risk.page.dataWarningBody",
                  "{{count}} of 6 data provider(s) could not be reached. Scores reflect conservative estimates.",
                  { count: unavailableCount }
                )}
              </span>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════
            2-COLUMN: Radar + Top Risks
        ════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6 mb-6">
          <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] p-6 bg-white dark:bg-[#161b22] shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-[#e6edf3]">
              {t("risk.page.categoryBreakdown", "Category Breakdown")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-[#7d8590] mt-0.5 mb-4">
              {t(
                "risk.page.categoryBreakdownDesc",
                "Your property vs area average"
              )}
            </p>
            <RiskBreakdownRadar breakdown={breakdown} propertyId={propertyId} height={280} />
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] p-6 bg-white dark:bg-[#161b22] shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-[#e6edf3]">
              {t("risk.page.topRisksTitle", "Top Risk Contributors")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-[#7d8590] mt-0.5 mb-4">
              {t(
                "risk.page.topRisksDesc",
                "Highest scoring factors driving overall risk"
              )}
            </p>
            <div className="space-y-2.5">
              {breakdown.factors?.slice(0, 3).map((factor, idx) => {
                const cat = CATEGORY_COLORS[factor.category] || CATEGORY_COLORS.MARKET;
                const meta = getRiskLevelMeta(factor.level);
                return (
                  <div
                    key={factor.category}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-[#30363d] bg-gray-50/60 dark:bg-[#1c2128] hover:border-gray-200 dark:hover:border-[#484f58] transition-colors"
                  >
                    {/* Rank badge */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black tabular-nums flex-shrink-0 ${cat.bg} ${cat.text}`}
                      style={{ boxShadow: `inset 0 0 0 1px ${cat.solid}30` }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
                        {t(
                          `risk.categories.${factor.category}`,
                          factor.category
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[#7d8590] truncate">
                        {factor.explanation?.split(".")[0]}.
                      </div>
                    </div>
                    <div
                      className="text-xl font-black tabular-nums flex-shrink-0"
                      style={{ color: meta.solid }}
                    >
                      {formatScore(factor.score)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            FULL FACTOR LIST
        ════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-[#21262d] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-[#e6edf3]">
                {t("risk.page.factorsTitle", "Risk Factors")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#7d8590] mt-0.5">
                {t(
                  "risk.page.factorsSubtitle",
                  "Ordered by risk contribution. Click any card to see full analysis."
                )}
              </p>
            </div>
            <button
              onClick={() => setShowMethodology((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-[#7d8590] hover:text-gray-900 dark:hover:text-[#e6edf3] transition-colors"
            >
              <Info className="w-3.5 h-3.5" strokeWidth={2} />
              {t("risk.page.methodology", "Methodology")}
            </button>
          </div>

          <div className="px-6">
            {breakdown.factors?.map((factor, idx) => (
              <RiskFactorCard
                key={factor.category}
                factor={factor}
                index={idx}
                defaultExpanded={idx === 0}
              />
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            RISK HISTORY
        ════════════════════════════════════════════════════════ */}
        <RiskHistorySection
          history={history}
          loading={loading}
          onRecalculate={recalculate}
          recalculating={recalculating}
        />

        {/* ════════════════════════════════════════════════════════
            METHODOLOGY
        ════════════════════════════════════════════════════════ */}
        {showMethodology && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <RiskExplainability />
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════════ */}
        <div className="border-t border-gray-200 dark:border-[#30363d] pt-6">
          <p className="text-xs text-gray-500 dark:text-[#7d8590] max-w-lg">
            {t(
              "risk.page.footerDisclaimer",
              "Risk scoring is based on 6 categories with transparent weightings. This is a decision support tool, not financial advice."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MetaPill — small pill with filled colored icon tile
   ══════════════════════════════════════════════════════════════ */

function MetaPill({ icon: Icon, iconBg, iconColor, value }) {
  return (
    <div className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-gray-50 dark:bg-[#1c2128] border border-gray-200/70 dark:border-[#30363d]">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center ${iconBg}`}
      >
        <Icon className={`w-3 h-3 ${iconColor}`} strokeWidth={2.5} />
      </div>
      <span className="text-xs font-semibold text-gray-900 dark:text-[#e6edf3] tabular-nums">
        {value}
      </span>
    </div>
  );
}