// frontend/src/app/properties/[id]/risk-analysis/page.jsx
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
import RiskSpectrum from "@/components/risk/RiskSpectrum";

export default function RiskAnalysisPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id;

  const { breakdown, loading, error, recalculating, recalculate } =
    useRiskAssessment(propertyId, { autoFetch: true });

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

  const overallMeta = getRiskLevelMeta(breakdown.overallLevel);
  const propertyThumbnail = propertyInfo ? getPropertyImage(propertyInfo) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">
      {/* ════════════════════════════════════════════════════════
          BREADCRUMB HEADER — FIX #1: py-3 → py-2 (tighter)
      ════════════════════════════════════════════════════════ */}
      <div className="border-b border-gray-200 dark:border-[#30363d]">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2 text-sm">
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* ════════════════════════════════════════════════════════
            PROPERTY CONTEXT STRIP
            FIX #2: Image w-20 h-20 → w-32 h-32
            FIX #3: Only ONE Generate Report CTA here (header)
        ════════════════════════════════════════════════════════ */}
        {propertyInfo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex gap-4 items-center"
          >
            {/* Property image — FIX #2: 128px × 128px */}
            <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d]">
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
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight truncate">
                {propertyInfo.address}
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[#7d8590] mt-0.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                <span className="truncate">
                  {propertyInfo.city}
                  {propertyInfo.state && `, ${propertyInfo.state}`}
                  {propertyInfo.zipCode && ` ${propertyInfo.zipCode}`}
                </span>
              </div>

              {/* Quick facts row */}
              <div className="flex items-center gap-4 mt-2 text-sm">
                {propertyInfo.marketValue != null && (
                  <span className="font-bold text-gray-900 dark:text-[#e6edf3]">
                    {formatINR(propertyInfo.marketValue)}
                  </span>
                )}
                {propertyInfo.area && (
                  <span className="inline-flex items-center gap-1 text-gray-600 dark:text-[#c9d1d9]">
                    <Maximize2 className="w-3.5 h-3.5" strokeWidth={2} />
                    {propertyInfo.area.toLocaleString()}{" "}
                    {t("property.details.sqft", "sq ft")}
                  </span>
                )}
                {propertyInfo.bedrooms && (
                  <span className="inline-flex items-center gap-1 text-gray-600 dark:text-[#c9d1d9]">
                    <Bed className="w-3.5 h-3.5" strokeWidth={2} />
                    {propertyInfo.bedrooms} {t("risk.page.bedShort", "BR")}
                  </span>
                )}
                {propertyInfo.propertyType && (
                  <span className="inline-flex items-center gap-1 text-gray-600 dark:text-[#c9d1d9]">
                    <Building2 className="w-3.5 h-3.5" strokeWidth={2} />
                    {propertyInfo.propertyType}
                  </span>
                )}
              </div>
            </div>

            {/* FIX #3: ONE Generate Report CTA — header only */}
            <Link
              href={`/properties/${propertyId}/generate-report`}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
            >
              <FileText className="w-4 h-4" strokeWidth={2.25} />
              {t("risk.page.generateReport", "Generate Report")}
            </Link>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════
            HERO — Severity Spectrum (dominant)
            FIX #4: Pass recalculating prop so RiskSpectrum
            can reset animation on recalculate complete
        ════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-200 dark:border-[#30363d] p-8 mb-6 bg-white dark:bg-[#0d1117]"
        >
          <RiskSpectrum
            score={breakdown.overallScore}
            level={breakdown.overallLevel}
            onRecalculate={recalculate}
            recalculating={recalculating}
          />
        </motion.div>

        {/* ════════════════════════════════════════════════════════
            DATA QUALITY WARNING — subtle, only if incomplete
        ════════════════════════════════════════════════════════ */}
        {breakdown.dataIncomplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-sm"
          >
            <AlertCircle
              className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <div className="text-amber-900 dark:text-amber-200">
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
                  { count: breakdown.unavailableProviderCount || 0 }
                )}
              </span>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════
            2-COLUMN: Radar (supporting) + Top Risks (list)
        ════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6 mb-8">
          {/* Radar — smaller, supporting */}
          <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] p-6 bg-white dark:bg-[#0d1117]">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] mb-1">
              {t("risk.page.categoryBreakdown", "Category Breakdown")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-[#7d8590] mb-4">
              {t(
                "risk.page.categoryBreakdownDesc",
                "All 6 risk factors visualized"
              )}
            </p>
            <RiskBreakdownRadar breakdown={breakdown} height={260} />
          </div>

          {/* Top 3 risks list — actionable summary */}
          <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] p-6 bg-white dark:bg-[#0d1117]">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] mb-1">
              {t("risk.page.topRisksTitle", "Top Risk Contributors")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-[#7d8590] mb-4">
              {t(
                "risk.page.topRisksDesc",
                "Highest scoring factors driving overall risk"
              )}
            </p>
            <div className="space-y-3">
              {breakdown.factors?.slice(0, 3).map((factor, idx) => {
                const meta = getRiskLevelMeta(factor.level);
                return (
                  <div
                    key={factor.category}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#161b22]"
                  >
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black tabular-nums"
                      style={{
                        backgroundColor: `${meta.solid}15`,
                        color: meta.solid,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">
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
                      className="text-lg font-bold tabular-nums flex-shrink-0"
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
            FULL FACTOR LIST — dense rows
        ════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-[#21262d] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">
                {t("risk.page.factorsTitle", "All Risk Factors")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#7d8590] mt-0.5">
                {t(
                  "risk.page.factorsSubtitle",
                  "Click any row for full analysis and recommendations"
                )}
              </p>
            </div>
            <button
              onClick={() => setShowMethodology((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#7d8590] hover:text-gray-900 dark:hover:text-[#e6edf3] transition-colors"
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
            METHODOLOGY — collapsible, footnote-style
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
            FOOTER — FIX #3: disclaimer text ONLY, no duplicate CTA
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