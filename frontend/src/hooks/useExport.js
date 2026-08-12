"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { exportService } from "@/services/exportService";
import { downloadUrl, downloadBlob } from "@/utils/downloadUtils";
import { EXPORT_STAGES, EXPORT_FORMATS } from "@/utils/exportConstants";

export function useExport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStage, setProgressStage] = useState(EXPORT_STAGES.IDLE);
  const [progressPercent, setProgressPercent] = useState(0);
  const [exportFormat, setExportFormat] = useState(EXPORT_FORMATS.PDF);

  const [historyData, setHistoryData] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const resetProgress = useCallback(() => {
    setIsGenerating(false);
    setProgressStage(EXPORT_STAGES.IDLE);
    setProgressPercent(0);
  }, []);

  const downloadPdf = useCallback(
    async (reportId) => {
      try {
        setIsGenerating(true);
        setExportFormat(EXPORT_FORMATS.PDF);
        setProgressStage(EXPORT_STAGES.PREPARING);
        setProgressPercent(25);
        await new Promise((res) => setTimeout(res, 300));
        setProgressStage(EXPORT_STAGES.GENERATING);
        setProgressPercent(60);
        await new Promise((res) => setTimeout(res, 300));
        setProgressStage(EXPORT_STAGES.DOWNLOADING);
        setProgressPercent(90);

        downloadUrl(`/api/export/report/${reportId}/pdf`);

        setProgressStage(EXPORT_STAGES.COMPLETED);
        setProgressPercent(100);
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
    async (reportId) => {
      try {
        setIsGenerating(true);
        setExportFormat(EXPORT_FORMATS.EXCEL);
        setProgressStage(EXPORT_STAGES.PREPARING);
        setProgressPercent(25);
        await new Promise((res) => setTimeout(res, 300));
        setProgressStage(EXPORT_STAGES.GENERATING);
        setProgressPercent(60);
        await new Promise((res) => setTimeout(res, 300));
        setProgressStage(EXPORT_STAGES.DOWNLOADING);
        setProgressPercent(90);

        downloadUrl(`/api/export/report/${reportId}/excel`);

        setProgressStage(EXPORT_STAGES.COMPLETED);
        setProgressPercent(100);
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
        await new Promise((res) => setTimeout(res, 500));

        // Bulk uses POST — need to trigger the download differently.
        // For bulk, we generate first, then use the result URL.
        // Since POST can't be done via iframe GET, we keep the service call
        // but use downloadUrl for the resulting download.
        const blob = await exportService.exportBulk(reportIds, format);

        setProgressStage(EXPORT_STAGES.DOWNLOADING);
        setProgressPercent(90);

        // For bulk ZIP — use blob since POST can't be triggered via window.open GET
        downloadBlob(blob, "bulk_due_diligence_reports.zip");

        setProgressStage(EXPORT_STAGES.COMPLETED);
        setProgressPercent(100);
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
    async (exportId) => {
      try {
        downloadUrl(`/api/export/${exportId}/download`);
      } catch (error) {
        console.error("Re-download failed:", error);
        toast.error("Download failed", {
          description: "Could not download the export file.",
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
    historyData,
    isHistoryLoading,
    downloadPdf,
    downloadExcel,
    downloadBulk,
    fetchHistory,
    downloadFromHistoryItem,
  };
}
