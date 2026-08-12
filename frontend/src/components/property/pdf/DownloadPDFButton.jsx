// frontend/src/components/property/pdf/DownloadPDFButton.jsx
"use client";

import { useState, useEffect } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getAggregatedProperty } from "@/services/aggregationService";
import { getPropertyRisk } from "@/services/propertyService";

export default function DownloadPDFButton({ property }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfLib, setPdfLib] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      import("@react-pdf/renderer"),
      import("./PropertyPDFDocument"),
    ])
      .then(([renderer, docModule]) => {
        if (!cancelled) {
          setPdfLib({ renderer, PDFDocument: docModule.default });
          setPdfReady(true);
        }
      })
      .catch(() => {
        // Silent — will retry on click
      });
    return () => { cancelled = true; };
  }, []);

  const handleDownload = async () => {
    if (!property?.id) return;
    if (loading) return;

    setLoading(true);

    try {
      let lib = pdfLib;
      if (!lib) {
        const [renderer, docModule] = await Promise.all([
          import("@react-pdf/renderer"),
          import("./PropertyPDFDocument"),
        ]);
        lib = { renderer, PDFDocument: docModule.default };
        setPdfLib(lib);
      }

      const { pdf } = lib.renderer;
      const PDFDocument = lib.PDFDocument;

      const [aggregated, risk] = await Promise.allSettled([
        getAggregatedProperty(property.id),
        getPropertyRisk(property.id),
      ]);

      const aggregatedData = aggregated.status === "fulfilled" ? aggregated.value : null;
      const riskData       = risk.status       === "fulfilled" ? risk.value       : null;

      if (!aggregatedData && !riskData) {
        toast.error(t("property.pdf.loadFailed"), {
          description: t("property.addModal.errors.tryAgainMoment"),
        });
        return;
      }

      const blob = await pdf(
        <PDFDocument
          property={property}
          aggregated={aggregatedData}
          risk={riskData}
        />
      ).toBlob();

      const filename = `due-diligence-${property.id}-${property.city ?? "property"}.pdf`
        .toLowerCase()
        .replace(/\s+/g, "-");

      const { downloadBlob } = await import("@/utils/downloadUtils");
      downloadBlob(blob, filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error(t("property.pdf.downloadFailed"), {
        description: err?.message ?? t("property.pdf.generateFailed"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-[#e6edf3] transition-all duration-150 hover:border-[#22C55E] hover:text-[#16a34a] dark:hover:text-green-400 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      title={pdfReady ? t("property.pdf.buttonTooltip") : t("property.pdf.preparing")}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.4} />
      ) : (
        <FileDown className="h-3 w-3" strokeWidth={2.4} />
      )}
      {loading ? t("property.pdf.generating") : t("property.pdf.downloadReport")}
    </button>
  );
}