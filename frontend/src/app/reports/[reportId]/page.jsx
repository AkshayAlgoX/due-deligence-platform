"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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

// TEMP DEBUG — remove after fix
if (typeof window !== "undefined") {
  console.log("=== SECTION RENDERER CHECK ===");
  console.log("COVER:", typeof ReportCoverSection, ReportCoverSection);
  console.log("EXEC:", typeof ReportExecutiveSummary, ReportExecutiveSummary);
  console.log("PROP:", typeof ReportPropertyOverview, ReportPropertyOverview);
  console.log("RISK:", typeof ReportRiskAnalysis, ReportRiskAnalysis);
  console.log("COMP:", typeof ReportComparableSection, ReportComparableSection);
  console.log("FIN:", typeof ReportFinancialSection, ReportFinancialSection);
  console.log("REC:", typeof ReportRecommendations, ReportRecommendations);
  console.log("APP:", typeof ReportAppendix, ReportAppendix);
}

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

function ErrorState({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-[17px] font-bold text-gray-900 dark:text-[#e6edf3] mb-2">
          {message || "Failed to load report"}
        </h2>
        <p className="text-[13px] text-gray-500 dark:text-[#7d8590] mb-5">
          The report could not be loaded. Please check the URL or try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-600 dark:text-[#7d8590] border border-gray-200 dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-all duration-150"
          >
            Go back
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-gray-900 dark:bg-[#e6edf3] text-white dark:text-[#0d1117] hover:bg-gray-700 dark:hover:bg-white transition-all duration-150"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InProgressState({ report }) {
  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/20 flex items-center justify-center mx-auto mb-4">
          <div className="w-7 h-7 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-[17px] font-bold text-gray-900 dark:text-[#e6edf3] mb-2">
          Report is generating…
        </h2>
        <p className="text-[13px] text-gray-500 dark:text-[#7d8590] mb-2">
          {report?.propertyAddress || "Your report"} is being prepared.
        </p>
        <p className="text-[12px] text-gray-400 dark:text-[#6e7681]">
          This page will refresh automatically when ready.
        </p>
      </div>
    </div>
  );
}

export default function ReportViewerPage() {
  const { reportId } = useParams();
  const router = useRouter();

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
        setError("Failed to load report. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Poll if report is in progress
  useEffect(() => {
    if (!report) return;
    if (report.status === "COMPLETED" || report.status === "FAILED") return;

    const interval = setInterval(async () => {
      try {
        const data = await reportService.getById(reportId);
        setReport(data);
        if (data.status === "COMPLETED" || data.status === "FAILED") {
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
      toast.success(`Version ${newReport.version} is being generated`);
      router.push(`/reports/${newReport.id}`);
    } catch {
      toast.error("Failed to regenerate report");
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
      toast.success("Report deleted");
      router.push("/reports");
    } catch {
      toast.error("Failed to delete report");
      setIsDeleting(false);
    }
  }

  // --- Render states ---
  if (loading) return <ReportViewerSkeleton />;

  if (notFound) {
    return (
      <ErrorState
        message="Report not found"
        onRetry={null}
      />
    );
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
    return (
      <ErrorState
        message={`Report generation failed${report.errorMessage ? `: ${report.errorMessage}` : ""}`}
        onRetry={() => {
          setRegenerateOpen(true);
        }}
      />
    );
  }

  // Sort sections
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
            {/* TOC */}
            <ReportViewerTOC sections={report.sections || []} />

            {/* Sections */}
            <main className="flex-1 min-w-0 space-y-6">
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
                  Report #{report.id} · Version {report.version} ·{" "}
                  {report.generatedByEmail} · Real Estate Due Diligence Agent
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