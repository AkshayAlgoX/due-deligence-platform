// frontend/src/app/properties/[id]/generate-report/page.jsx
"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CheckSquare,
  FileText,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  Square,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import api from "@/services/api";
import { API_ROUTES } from "@/constants/apiRoutes";
import { getPropertyImage } from "@/constants/propertyImages";
import { useReport } from "@/hooks/useReport";
import { formatINR } from "@/utils/currency";

import PropertyImagePlaceholder from "@/components/property/PropertyImagePlaceholder";
import ReportGeneratingModal from "@/components/reports/ReportGeneratingModal";

export default function GenerateReportPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id;

  const [propertyInfo, setPropertyInfo] = useState(null);
  const [title, setTitle] = useState("");
  const [forceRecalculate, setForceRecalculate] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [planLimitReached, setPlanLimitReached] = useState(false);

  const {
    report,
    status,
    error,
    generating,
    generate,
  } = useReport();

  // ── Load property info for context ──
  useEffect(() => {
    if (!propertyId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(API_ROUTES.PROPERTY_BY_ID(propertyId));
        if (!cancelled) {
          setPropertyInfo(res.data);
          // Prefill title with property address
          setTitle(
            t("report.generate.defaultTitle", "Due Diligence: {{address}}", {
              address: res.data.address,
            })
          );
        }
      } catch (err) {
        console.warn("Failed to load property info:", err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [propertyId, t]);

  // ── Handle generate button click ──
  const handleGenerate = async () => {
    setModalOpen(true);
    try {
      await generate({
        propertyId: Number(propertyId),
        title: title?.trim() || undefined,
        forceRecalculate,
      });
    } catch (err) {
      // Plan-limit exceeded → show upgrade modal instead of the failed state
      if (err?.response?.status === 402 || err?.response?.data?.planLimitReached) {
        setModalOpen(false);
        setPlanLimitReached(true);
      } else {
        // Error already captured by hook; modal will show FAILED state
        console.error("Generate failed:", err);
      }
    }
  };

  // ── Handle modal close ──
  const handleModalClose = () => {
    setModalOpen(false);
  };

  // ── Handle redirect on completion ──
  const handleRedirect = (reportId) => {
    if (reportId) {
      router.push(`/reports/${reportId}`);
    }
  };

  // ── Handle retry ──
  const handleRetry = () => {
    setModalOpen(false);
    // Small delay to reset modal state before retriggering
    setTimeout(() => {
      handleGenerate();
    }, 200);
  };

  const propertyThumbnail = propertyInfo ? getPropertyImage(propertyInfo) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-gray-200 dark:border-[#30363d]">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-2 text-sm">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-gray-500 dark:text-[#7d8590] hover:text-gray-900 dark:hover:text-[#e6edf3] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            {t("report.generate.back", "Back")}
          </button>
          <span className="text-gray-300 dark:text-[#484f58]">/</span>
          <span className="text-gray-900 dark:text-[#e6edf3] font-medium">
            {t("report.generate.title", "Generate Report")}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
              <FileText
                className="w-4.5 h-4.5 text-white dark:text-gray-900"
                strokeWidth={2.25}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight">
              {t(
                "report.generate.heading",
                "Generate Due Diligence Report"
              )}
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-[#7d8590] ml-12">
            {t(
              "report.generate.subheading",
              "A comprehensive 8-section report combining property data, risk analysis, financials, and recommendations."
            )}
          </p>
        </motion.div>

        {/* ── Property context card ── */}
        {propertyInfo && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden"
          >
           <div className="p-5 flex items-center gap-5">
  <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d]">
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
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-1">
                  {t("report.generate.reportingOn", "Reporting on")}
                </div>
                <div className="text-base font-bold text-gray-900 dark:text-[#e6edf3] truncate">
                  {propertyInfo.address}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#7d8590] mt-1">
                  <MapPin className="w-3 h-3" strokeWidth={2} />
                  <span className="truncate">
                    {propertyInfo.city}
                    {propertyInfo.state && `, ${propertyInfo.state}`}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  {propertyInfo.marketValue != null && (
                    <span className="font-bold text-gray-900 dark:text-[#e6edf3]">
                      {formatINR(propertyInfo.marketValue)}
                    </span>
                  )}
                  {propertyInfo.propertyType && (
                    <span className="inline-flex items-center gap-1 text-gray-500 dark:text-[#7d8590]">
                      <Building2 className="w-3 h-3" strokeWidth={2} />
                      {propertyInfo.propertyType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Form: Title + Options ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 mb-6"
        >
          {/* Title input */}
          <label className="block mb-5">
            <span className="block text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-[#c9d1d9] mb-2">
              {t("report.generate.titleLabel", "Report title")}
              <span className="text-gray-400 dark:text-[#6e7681] font-normal normal-case tracking-normal ml-1">
                ({t("common.optional", "optional")})
              </span>
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={generating || modalOpen}
              placeholder={t(
                "report.generate.titlePlaceholder",
                "e.g. Due Diligence: 456 Avenue Road"
              )}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-sm text-gray-900 dark:text-[#e6edf3] placeholder:text-gray-400 dark:placeholder:text-[#6e7681] focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-400 dark:focus:border-[#484f58] transition-colors disabled:opacity-50"
              maxLength={200}
            />
          </label>

          {/* Force recalculate checkbox */}
          <button
            type="button"
            onClick={() => setForceRecalculate((v) => !v)}
            disabled={generating || modalOpen}
            className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-[#30363d] hover:border-gray-300 dark:hover:border-[#484f58] hover:bg-gray-50 dark:hover:bg-[#0d1117] transition-colors text-left disabled:opacity-50"
          >
            <div className="mt-0.5 flex-shrink-0">
              {forceRecalculate ? (
                <CheckSquare
                  className="w-4 h-4 text-gray-900 dark:text-[#e6edf3]"
                  strokeWidth={2.25}
                />
              ) : (
                <Square
                  className="w-4 h-4 text-gray-400 dark:text-[#6e7681]"
                  strokeWidth={2}
                />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">
                {t(
                  "report.generate.forceRecalcLabel",
                  "Force fresh risk recalculation"
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-[#7d8590] mt-0.5 leading-relaxed">
                {t(
                  "report.generate.forceRecalcHint",
                  "Skips cached risk data and re-runs all 6 scoring engines. Adds ~5 seconds to generation."
                )}
              </div>
            </div>
          </button>

          {/* Info note */}
          <div className="mt-5 flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-[#0d1117] text-xs text-gray-600 dark:text-[#c9d1d9]">
            <Info
              className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400"
              strokeWidth={2}
            />
            <span className="leading-relaxed">
              {t(
                "report.generate.infoNote",
                "The report will be generated asynchronously. You can safely close this page — the report will still complete and appear in My Reports."
              )}
            </span>
          </div>
        </motion.div>

        {/* ── Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 sm:justify-end"
        >
          <Link
            href={`/properties/${propertyId}/risk-analysis`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-[#e6edf3] border border-gray-200 dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors"
          >
            {t("report.generate.cancel", "Cancel")}
          </Link>
          <button
            onClick={handleGenerate}
            disabled={generating || modalOpen}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("report.generate.starting", "Starting…")}
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" strokeWidth={2.25} />
                {t("report.generate.cta", "Generate Report")}
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* ── Generating modal ── */}
      <ReportGeneratingModal
        open={modalOpen}
        status={status}
        error={error}
        reportId={report?.id}
        onClose={handleModalClose}
        onRedirect={handleRedirect}
        onRetry={handleRetry}
      />

      {/* ── Plan-limit upgrade modal ── */}
      {planLimitReached && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-[#e6edf3]">
              Free plan limit reached
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-[#7d8590] leading-relaxed">
              You've generated 3 reports this month on the Free plan. Upgrade to Pro for
              unlimited reports, all export formats, and white-label PDFs.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setPlanLimitReached(false)}
                className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-[#30363d] text-sm font-bold text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2128] transition"
              >
                Not now
              </button>
              <Link
                href="/checkout?plan=pro"
                className="flex-1 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition flex items-center justify-center"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}