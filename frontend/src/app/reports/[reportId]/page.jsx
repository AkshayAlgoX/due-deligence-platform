// frontend/src/app/reports/[reportId]/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import reportService from "@/services/reportService";
import { sortSections } from "@/utils/reportUtils";

import ReportViewerSkeleton from "@/components/reports/ReportViewerSkeleton";
import ReportViewerHeader from "@/components/reports/ReportViewerHeader";
import ReportViewerTOC from "@/components/reports/ReportViewerTOC";
import RegenerateConfirmModal from "@/components/reports/RegenerateConfirmModal";
import DeleteReportModal from "@/components/reports/DeleteReportModal";
import ReportVersionHistoryModal from "@/components/reports/ReportVersionHistoryModal";

// Section renderers
import ReportCoverSection from "@/components/reports/sections/ReportCoverSection";
import ReportExecutiveSummary from "@/components/reports/sections/ReportExecutiveSummary";
import ReportPropertyOverview from "@/components/reports/sections/ReportPropertyOverview";
import ReportRiskAnalysis from "@/components/reports/sections/ReportRiskAnalysis";
import ReportComparableSection from "@/components/reports/sections/ReportComparableSection";
import ReportFinancialSection from "@/components/reports/sections/ReportFinancialSection";
import ReportRecommendations from "@/components/reports/sections/ReportRecommendations";
import ReportAppendix from "@/components/reports/sections/ReportAppendix";
import HighRiskBanner from "@/components/reports/HighRiskBanner";
import { celebrateOnce } from "@/lib/celebrate";

// Section renderer map — order enforced by sortSections() in reportUtils
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

// AI summary card
import AISummaryCard from "@/components/reports/AISummaryCard";

function ErrorState({ message, onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-[17px] font-bold text-gray-900 dark:text-[#e6edf3] mb-2">
          {message || t("report.viewer.notFound")}
        </h2>
        <p className="text-[13px] text-gray-500 dark:text-[#7d8590] mb-5">
          {t("report.viewer.notFoundBody")}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-600 dark:text-[#7d8590] border border-gray-200 dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-all duration-150"
          >
            {t("report.viewer.goBack")}
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-gray-900 dark:bg-[#e6edf3] text-white dark:text-[#0d1117] hover:bg-gray-700 dark:hover:bg-white transition-all duration-150"
            >
              {t("report.list.tryAgain")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InProgressState({ report }) {
  const { t } = useTranslation();
  const address =
    report?.propertyAddress ||
    t("report.viewer.inProgress.fallbackAddress");

  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/20 flex items-center justify-center mx-auto mb-4">
          <div className="w-7 h-7 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-[17px] font-bold text-gray-900 dark:text-[#e6edf3] mb-2">
          {t("report.viewer.inProgress.title")}
        </h2>
        <p className="text-[13px] text-gray-500 dark:text-[#7d8590] mb-2">
          {t("report.viewer.inProgress.body", { address })}
        </p>
        <p className="text-[12px] text-gray-400 dark:text-[#6e7681]">
          {t("report.viewer.inProgress.hint")}
        </p>
      </div>
    </div>
  );
}

export default function ReportViewerPage() {
  const { reportId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Modal states
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!reportId) return;
    try {
      const data = await reportService.getById(reportId);
      setReport(data);
      setError(null);
      setNotFound(false);
    } catch (err) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(t("report.viewer.notFoundBody"));
      }
    } finally {
      setLoading(false);
    }
  }, [reportId, t]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Poll if report is in progress
 useEffect(() => {
  if (!report) return;
  if (report.status === "COMPLETED" || report.status === "FAILED") {
    // 🎉 Celebrate first-time completion
    if (report.status === "COMPLETED") {
      celebrateOnce(`report-${report.id}`, "report-complete");
    }
    return;
  }

  const interval = setInterval(async () => {
    try {
      const data = await reportService.getById(reportId);
      setReport(data);
      if (data.status === "COMPLETED") {
        celebrateOnce(`report-${data.id}`, "report-complete");
        clearInterval(interval);
      } else if (data.status === "FAILED") {
        clearInterval(interval);
      }
    } catch {
      clearInterval(interval);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [report?.status, reportId]);

  async function handleRegenerate() {
    if (!report) return;
    setIsRegenerating(true);
    try {
      const newReport = await reportService.regenerate(report.id);
      setRegenerateOpen(false);
      toast.success(
        t("report.regenerate.success", { version: newReport.version })
      );
      router.push(`/reports/${newReport.id}`);
    } catch {
      toast.error(t("report.regenerate.error"));
    } finally {
      setIsRegenerating(false);
    }
  }

  async function handleDelete() {
    if (!report) return;
    setIsDeleting(true);
    try {
      await reportService.delete(report.id);
      setDeleteOpen(false);
      toast.success(t("report.list.deleted"));
      router.push("/reports");
    } catch {
      toast.error(t("report.list.deleteFailed"));
      setIsDeleting(false);
    }
  }

  // --- Render states ---
  if (loading) return <ReportViewerSkeleton />;

  if (notFound) {
    return <ErrorState message={t("report.viewer.notFound")} onRetry={null} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchReport} />;
  }

  if (!report) return null;

  // In-progress report
  if (report.status === "GENERATING" || report.status === "PENDING") {
    return <InProgressState report={report} />;
  }

  // Failed report
  if (report.status === "FAILED") {
    const failedMessage = report.errorMessage
      ? `${t("report.viewer.failed.title")}: ${report.errorMessage}`
      : t("report.viewer.failed.title");
    return (
      <ErrorState
        message={failedMessage}
        onRetry={() => {
          setRegenerateOpen(true);
        }}
      />
    );
  }

  // ── Sort sections into canonical order ──
  // Order: COVER → EXECUTIVE_SUMMARY → PROPERTY_OVERVIEW → RISK_ANALYSIS →
  //        COMPARABLE → FINANCIAL → RECOMMENDATIONS → APPENDIX
  const sortedSections = sortSections(report.sections || []);

  return (
    <>
      <div className="min-h-screen bg-[#F6F8FB] dark:bg-[#0d1117]">
        {/* Sticky Header */}
        <ReportViewerHeader
          report={report}
          onRegenerate={() => setRegenerateOpen(true)}
          onDelete={() => setDeleteOpen(true)}
          onVersionHistory={() => setHistoryOpen(true)}
          isRegenerating={isRegenerating}
        />

        {/* Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex gap-8">
            {/* TOC — pass sorted sections so TOC order matches render order */}
            <ReportViewerTOC sections={sortedSections} />

            {/* Sections rendered in canonical order */}
            <main className="flex-1 min-w-0 space-y-6">
              {/* ⭐ AI Summary — auto-generated on first view, cached after */}
              <HighRiskBanner score={report.riskScoreSnapshot} />
              <AISummaryCard reportId={report.id} />

              {sortedSections.map((section) => {
                const Renderer = SECTION_RENDERERS[section.sectionType];
                if (!Renderer) return null;
                return (
                  <Renderer
                    key={section.id}
                    section={section}
                    report={report}
                  />
                );
              })}

              {/* Footer */}
              <div className="py-6 text-center">
                <p className="text-[12px] text-gray-400 dark:text-[#6e7681]">
                  {t("report.viewer.footer", {
                    id: report.id,
                    version: report.version,
                    email: report.generatedByEmail,
                  })}
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RegenerateConfirmModal
        isOpen={regenerateOpen}
        onClose={() => setRegenerateOpen(false)}
        onConfirm={handleRegenerate}
        report={report}
        isLoading={isRegenerating}
      />
      <DeleteReportModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        report={report}
        isLoading={isDeleting}
      />
      <ReportVersionHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        currentReport={report}
      />
    </>
  );
}