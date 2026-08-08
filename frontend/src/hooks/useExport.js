"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { exportService } from "@/services/exportService";
import { downloadBlob } from "@/utils/downloadUtils";
import { EXPORT_STAGES, EXPORT_FORMATS } from "@/utils/exportConstants";

export function useExport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStage, setProgressStage] = useState(EXPORT_STAGES.IDLE);
  const [progressPercent, setProgressPercent] = useState(0);
  const [exportFormat, setExportFormat] = useState(EXPORT_FORMATS.PDF);

  // History state — kept (history moved to dedicated page, not removed)
  const [historyData, setHistoryData] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Aligned to 2500ms — modal auto-dismisses at 2000ms,
  // this gives framer-motion exit animation time to complete
  const resetProgress = useCallback(() => {
    setIsGenerating(false);
    setProgressStage(EXPORT_STAGES.IDLE);
    setProgressPercent(0);
  }, []);

  const downloadPdf = useCallback(
    async (reportId, filename = `report_${reportId}.pdf`) => {
      try {
        setIsGenerating(true);
        setExportFormat(EXPORT_FORMATS.PDF);
        setProgressStage(EXPORT_STAGES.PREPARING);
        setProgressPercent(25);

        await new Promise((res) => setTimeout(res, 200));
        setProgressStage(EXPORT_STAGES.GENERATING);
        setProgressPercent(60);

        const blob = await exportService.exportPdf(reportId);

        setProgressStage(EXPORT_STAGES.DOWNLOADING);
        setProgressPercent(90);

        downloadBlob(blob, filename);

        setProgressStage(EXPORT_STAGES.COMPLETED);
        setProgressPercent(100);

        toast.success("PDF Export Ready", {
          description: `Downloaded ${filename} successfully.`,
        });
      } catch (error) {
        console.error("PDF export failed:", error);
        toast.error("PDF Export Failed", {
          description: error?.message || "Failed to generate PDF document.",
        });
        setProgressStage(EXPORT_STAGES.FAILED);
      } finally {
        setTimeout(resetProgress, 2500);
      }
    },
    [resetProgress]
  );

  const downloadExcel = useCallback(
    async (reportId, filename = `report_${reportId}.xlsx`) => {
      try {
        setIsGenerating(true);
        setExportFormat(EXPORT_FORMATS.EXCEL);
        setProgressStage(EXPORT_STAGES.PREPARING);
        setProgressPercent(25);

        await new Promise((res) => setTimeout(res, 200));
        setProgressStage(EXPORT_STAGES.GENERATING);
        setProgressPercent(60);

        const blob = await exportService.exportExcel(reportId);

        setProgressStage(EXPORT_STAGES.DOWNLOADING);
        setProgressPercent(90);

        downloadBlob(blob, filename);

        setProgressStage(EXPORT_STAGES.COMPLETED);
        setProgressPercent(100);

        toast.success("Excel Export Ready", {
          description: `Downloaded ${filename} successfully.`,
        });
      } catch (error) {
        console.error("Excel export failed:", error);
        toast.error("Excel Export Failed", {
          description: error?.message || "Failed to generate Excel workbook.",
        });
        setProgressStage(EXPORT_STAGES.FAILED);
      } finally {
        setTimeout(resetProgress, 2500);
      }
    },
    [resetProgress]
  );

  const downloadBulk = useCallback(
    async (reportIds, format = EXPORT_FORMATS.PDF) => {
      if (!reportIds || reportIds.length === 0) {
        toast.warning("No Reports Selected", {
          description: "Please select at least one report for bulk export.",
        });
        return;
      }

      try {
        setIsGenerating(true);
        setExportFormat(EXPORT_FORMATS.ZIP);
        setProgressStage(EXPORT_STAGES.PREPARING);
        setProgressPercent(20);

        const blob = await exportService.exportBulk(reportIds, format);

        setProgressStage(EXPORT_STAGES.DOWNLOADING);
        setProgressPercent(90);

        downloadBlob(blob, `bulk_due_diligence_reports.zip`);

        setProgressStage(EXPORT_STAGES.COMPLETED);
        setProgressPercent(100);

        toast.success("Bulk Export Ready", {
          description: `Exported ${reportIds.length} reports into ZIP archive.`,
        });
      } catch (error) {
        console.error("Bulk export failed:", error);
        toast.error("Bulk Export Failed", {
          description: "An error occurred while creating bulk export archive.",
        });
        setProgressStage(EXPORT_STAGES.FAILED);
      } finally {
        setTimeout(resetProgress, 2500);
      }
    },
    [resetProgress]
  );

  const fetchHistory = useCallback(async (page = 0, size = 10) => {
    try {
      setIsHistoryLoading(true);
      const data = await exportService.getHistory(page, size);
      setHistoryData(data);
    } catch (error) {
      console.error("Fetch history failed:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  const downloadFromHistoryItem = useCallback(
    async (exportId, filename = "export.pdf") => {
      try {
        const blob = await exportService.downloadFromHistory(exportId);
        downloadBlob(blob, filename);
        toast.success("Re-download Complete", {
          description: `Downloaded ${filename}.`,
        });
      } catch (error) {
        console.error("Re-download failed:", error);
        toast.error("Re-download Failed", {
          description: "Could not fetch past export file.",
        });
      }
    },
    []
  );

  return {
    isGenerating,
    progressStage,
    progressPercent,
    exportFormat,

    // Preview state intentionally removed (Issue 2)
    // ExportPreviewModal.jsx deleted — redundant with report TOC sidebar

    historyData,
    isHistoryLoading,

    downloadPdf,
    downloadExcel,
    downloadBulk,
    fetchHistory,
    downloadFromHistoryItem,
  };
}