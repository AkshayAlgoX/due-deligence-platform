"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import reportService from "@/services/reportService";
import { sortSections } from "@/utils/reportUtils";

// Section renderers (same as viewer)
import ReportCoverSection from "@/components/reports/sections/ReportCoverSection";
import ReportExecutiveSummary from "@/components/reports/sections/ReportExecutiveSummary";
import ReportPropertyOverview from "@/components/reports/sections/ReportPropertyOverview";
import ReportRiskAnalysis from "@/components/reports/sections/ReportRiskAnalysis";
import ReportComparableSection from "@/components/reports/sections/ReportComparableSection";
import ReportFinancialSection from "@/components/reports/sections/ReportFinancialSection";
import ReportRecommendations from "@/components/reports/sections/ReportRecommendations";
import ReportAppendix from "@/components/reports/sections/ReportAppendix";

const SECTION_RENDERERS = {
  COVER: ReportCoverSection,
  EXECUTIVE_SUMMARY: ReportExecutiveSummary,
  PROPERTY_OVERVIEW: ReportPropertyOverview,
  RISK_ANALYSIS: ReportRiskAnalysis,
  COMPARABLE: ReportComparableSection,
  FINANCIAL: ReportFinancialSection,
  RECOMMENDATIONS: ReportRecommendations,
  APPENDIX: ReportAppendix,
};

export default function ReportPrintPage() {
  const { reportId } = useParams();
  const { t } = useTranslation();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reportId) return;
    reportService
      .getById(reportId)
      .then((data) => setReport(data))
      .catch(() => setError(t("report.print.loadFailed")))
      .finally(() => setLoading(false));
  }, [reportId, t]);

  // Auto-print once report loads
  useEffect(() => {
    if (!report) return;
    const timer = setTimeout(() => window.print(), 800);
    return () => clearTimeout(timer);
  }, [report]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {t("report.print.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">
          {error || t("report.print.notFound")}
        </p>
      </div>
    );
  }

  const sortedSections = sortSections(report.sections || []);

  return (
    <>
      {/* Print styles injected as a style tag */}
      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: white !important; }
          .print-section { page-break-after: always; }
          .print-section:last-child { page-break-after: avoid; }
          .no-print { display: none !important; }
          /* Force light theme for print */
          * { color-scheme: light !important; }
        }
        @media screen {
          body { background: #f6f8fb; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-6 py-8 bg-white min-h-screen">
        {/* Print header — screen only */}
        <div className="no-print mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {t("report.print.screenHeader", { id: report.id })}
          </p>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors"
          >
            {t("report.print.printNow")}
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sortedSections.map((section, index) => {
            const Renderer = SECTION_RENDERERS[section.sectionType];
            if (!Renderer) return null;
            return (
              <div
                key={section.id}
                className={index < sortedSections.length - 1 ? "print-section" : ""}
              >
                <Renderer section={section} report={report} />
              </div>
            );
          })}
        </div>

        {/* Print footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            {t("report.print.footer", {
              id: report.id,
              version: report.version,
              email: report.generatedByEmail,
            })}
          </p>
        </div>
      </div>
    </>
  );
}