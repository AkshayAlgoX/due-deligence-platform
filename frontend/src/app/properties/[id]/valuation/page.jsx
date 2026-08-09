"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getPropertyById } from "@/services/propertyService";
import { getPriceTrends } from "@/services/comparableService";
import { useValuation } from "@/hooks/useValuation";

import ValuationSummary from "@/components/valuation/ValuationSummary";
import ValuationMethodsChart from "@/components/valuation/ValuationMethodsChart";
import PriceTrendGraph from "@/components/valuation/PriceTrendGraph";
import PricePerSqftChart from "@/components/valuation/PricePerSqftChart";

export default function ValuationPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id;

  const [propertyInfo, setPropertyInfo] = useState(null);
  const [priceTrends, setPriceTrends] = useState([]);

  const {
    valuation,
    breakdown,
    hasValuation,
    loading,
    calculating,
    error,
    calculate,
  } = useValuation(propertyId, { autoFetch: true });

  useEffect(() => {
    if (!propertyId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getPriceTrends(propertyId);
        if (!cancelled) setPriceTrends(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setPriceTrends([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

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

  const handleCalculate = async () => {
    try {
      await calculate();
      toast.success(t("report.valuation.calculatedSuccess"));
    } catch (err) {
      toast.error(t("report.valuation.calculatedFailed"), { description: err?.message });
    }
  };

  if (loading && !breakdown) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-[#7d8590]" />
          <p className="text-sm text-gray-500 dark:text-[#7d8590]">{t("report.valuation.page.loading")}</p>
        </div>
      </div>
    );
  }

  if (error && !breakdown) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="text-base font-semibold text-gray-900 dark:text-[#e6edf3] mb-2">
            {t("report.valuation.page.errorTitle")}
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
            {t("report.valuation.title")}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight">
            {t("report.valuation.title")}
          </h1>
          {propertyInfo && (
            <p className="text-sm text-gray-500 dark:text-[#7d8590] mt-0.5">
              {propertyInfo.address}
            </p>
          )}
        </div>

        <ValuationSummary
          valuation={valuation}
          hasValuation={hasValuation}
          calculating={calculating}
          onCalculate={handleCalculate}
        />

        {hasValuation && breakdown && (
          <>
            <ValuationMethodsChart breakdown={breakdown} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PriceTrendGraph trends={priceTrends} />
              <PricePerSqftChart trends={priceTrends} />
            </div>
          </>
        )}

        <div className="border-t border-gray-200 dark:border-[#30363d] pt-6">
          <p className="text-xs text-gray-500 dark:text-[#7d8590] max-w-lg">
            {t("report.valuation.footerDisclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}