"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Loader2,
} from "lucide-react";

import { getPropertyById } from "@/services/propertyService";
import { useComparables } from "@/hooks/useComparables";

import ComparableMap from "@/components/comparables/ComparableMap";
import ComparableCard from "@/components/comparables/ComparableCard";
import ComparableTable from "@/components/comparables/ComparableTable";
import RadiusSelector from "@/components/comparables/RadiusSelector";

export default function ComparablesPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id;

  const [propertyInfo, setPropertyInfo] = useState(null);
  const [view, setView] = useState("grid"); // "grid" | "table"

  const {
    analysis,
    comparables,
    radius,
    setRadius,
    loading,
    error,
    refresh,
  } = useComparables(propertyId, { autoFetch: true, defaultRadius: 5 });

  useEffect(() => {
    if (!propertyId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getPropertyById(propertyId);
        if (!cancelled) setPropertyInfo(data);
      } catch (err) {
        console.warn("Failed to load property info:", err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const subjectPricePerSqft =
    propertyInfo?.marketValue && propertyInfo?.area
      ? Math.round(propertyInfo.marketValue / propertyInfo.area)
      : null;

  if (loading && !analysis) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-[#7d8590]" />
          <p className="text-sm text-gray-500 dark:text-[#7d8590]">
            {t("report.comparable.page.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="text-base font-semibold text-gray-900 dark:text-[#e6edf3] mb-2">
            {t("report.comparable.page.errorTitle")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#7d8590] mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-[#30363d] text-sm font-medium text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#161b22]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("risk.page.goBack")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">
      {/* Breadcrumb header — matches risk-analysis/page.jsx pattern */}
      <div className="border-b border-gray-200 dark:border-[#30363d]">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2 text-sm">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-gray-500 dark:text-[#7d8590] hover:text-gray-900 dark:hover:text-[#e6edf3] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            {t("risk.page.backToProperty")}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-[#484f58]" />
          <span className="text-gray-900 dark:text-[#e6edf3] font-medium">
            {t("report.comparable.title")}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header + controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight">
              {t("report.comparable.title")}
            </h1>
            {propertyInfo && (
              <p className="text-sm text-gray-500 dark:text-[#7d8590] mt-0.5">
                {propertyInfo.address}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <RadiusSelector value={radius} onChange={setRadius} disabled={loading} />
            <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#1c2128] p-1">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`rounded-lg p-1.5 transition-all ${
                  view === "grid"
                    ? "bg-white dark:bg-[#0d1117] text-[#16a34a] dark:text-green-400 shadow-sm"
                    : "text-gray-400 dark:text-[#6e7681]"
                }`}
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setView("table")}
                className={`rounded-lg p-1.5 transition-all ${
                  view === "table"
                    ? "bg-white dark:bg-[#0d1117] text-[#16a34a] dark:text-green-400 shadow-sm"
                    : "text-gray-400 dark:text-[#6e7681]"
                }`}
              >
                <List className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Map */}
        <ComparableMap subject={propertyInfo} comparables={comparables} loading={loading} />

        {/* Results */}
        {comparables.length === 0 && !loading ? (
          <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-10 text-center">
            <p className="text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">
              {t("report.comparable.noResults")}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-[#7d8590]">
              {t("report.comparable.noResultsDesc")}
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparables.map((c) => (
              <ComparableCard key={c.id} comparable={c} subjectPricePerSqft={subjectPricePerSqft} />
            ))}
          </div>
        ) : (
          <ComparableTable comparables={comparables} subjectPricePerSqft={subjectPricePerSqft} />
        )}
      </div>
    </div>
  );
}