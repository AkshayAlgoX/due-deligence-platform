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

        // Detect JSON error disguised as blob (backend 500 returns JSON with responseType:"blob")
        await throwIfJsonError(blob);

        setProgressStage(EXPORT_STAGES.DOWNLOADING);
        setProgressPercent(90);

        downloadBlob(blob, filename);

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

        await throwIfJsonError(blob);

        setProgressStage(EXPORT_STAGES.DOWNLOADING);
        setProgressPercent(90);

        downloadBlob(blob, filename);

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

        const blob = await exportService.exportBulk(reportIds, format);

        await throwIfJsonError(blob);

        setProgressStage(EXPORT_STAGES.DOWNLOADING);
        setProgressPercent(90);

        downloadBlob(blob, `bulk_due_diligence_reports.zip`);

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
    async (exportId, filename = "export.pdf") => {
      try {
        const blob = await exportService.downloadFromHistory(exportId);

        await throwIfJsonError(blob);

        if (!blob || !(blob instanceof Blob) || blob.size === 0) {
          try {
            const text = blob ? await blob.text() : "";
            const parsed = text ? JSON.parse(text) : null;
            throw new Error(parsed?.message || "Export file is empty");
          } catch (parseErr) {
            if (parseErr.message && parseErr.message !== "Export file is empty") {
              throw parseErr;
            }
            throw new Error("Export file is empty or corrupted");
          }
        }

        downloadBlob(blob, filename);
      } catch (error) {
        console.error("Re-download failed:", error);

        // Extract meaningful message from error
        const message = error?.message || "";
        if (message.includes("no longer available") || message.includes("deleted")) {
          toast.error("Export no longer available", {
            description: "The original report was deleted. Please generate a new export.",
          });
        } else if (message.includes("Access denied") || error?.status === 403) {
          toast.error("Access denied", {
            description: "You don't have permission to download this export.",
          });
        } else if (message.includes("not found") || error?.status === 404) {
          toast.error("Export not found", {
            description: "This export record no longer exists.",
          });
        } else {
          toast.error("Download failed", {
            description: message || "Could not download the export file.",
          });
        }
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

/**
 * Detects JSON error responses disguised as blobs when using responseType:"blob".
 * Backend returns {"success":false,"message":"..."} for errors,
 * but Axios wraps them as Blobs since we requested blob response type.
 *
 * Without this check, the JSON error gets "downloaded" as a .pdf/.xlsx file
 * and the user sees no error feedback — total silent failure.
 */
async function throwIfJsonError(blob) {
  if (!blob || !(blob instanceof Blob) || blob.size === 0) return;
  // Check first 100 bytes — JSON errors start with {"success":false
  const header = await blob.slice(0, 100).text();
  if (header.startsWith('{"success":false')) {
    const full = await blob.text();
    try {
      const parsed = JSON.parse(full);
      throw new Error(parsed.message || "Server returned an error");
    } catch (e) {
      if (e.message && e.message.startsWith("Server returned")) throw e;
      throw new Error("Export failed — server returned an error");
    }
  }
}