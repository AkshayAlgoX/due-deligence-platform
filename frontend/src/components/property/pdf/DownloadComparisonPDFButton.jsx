// frontend/src/components/property/pdf/DownloadComparisonPDFButton.jsx
"use client";

import { useState, useEffect } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * DownloadComparisonPDFButton
 *
 * Generates a comparison PDF from the already-fetched properties,
 * aggregated data, and risk scores (no extra network calls).
 *
 * Props:
 *   properties  - array of PropertyResponse
 *   aggregated  - array of AggregatedPropertyResponse
 *   risks       - array of RiskScoreResponse
 */
export default function DownloadComparisonPDFButton({
  properties = [],
  aggregated = [],
  risks = [],
}) {
  const [loading,  setLoading]  = useState(false);
  const [pdfLib,   setPdfLib]   = useState(null);

  // Pre-load PDF engine on mount
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      import("@react-pdf/renderer"),
      import("./ComparisonPDFDocument"),
    ])
      .then(([renderer, docModule]) => {
        if (!cancelled) {
          setPdfLib({ renderer, PDFDocument: docModule.default });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleDownload = async () => {
    if (loading || properties.filter(Boolean).length < 2) return;
    setLoading(true);

    try {
      let lib = pdfLib;
      if (!lib) {
        const [renderer, docModule] = await Promise.all([
          import("@react-pdf/renderer"),
          import("./ComparisonPDFDocument"),
        ]);
        lib = { renderer, PDFDocument: docModule.default };
        setPdfLib(lib);
      }

      const { pdf } = lib.renderer;
      const PDFDocument = lib.PDFDocument;

      const blob = await pdf(
        <PDFDocument
          properties={properties}
          aggregated={aggregated}
          risks={risks}
        />
      ).toBlob();

      const url      = URL.createObjectURL(blob);
      const ids      = properties.filter(Boolean).map((p) => p.id).join("-");
      const filename = `comparison-${ids}.pdf`;

      const link = document.createElement("a");
      link.href     = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Comparison PDF failed:", err);
      toast.error("Download failed", {
        description: err?.message ?? "Could not generate the comparison report.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading || properties.filter(Boolean).length < 2}
      className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-150 hover:border-[#22C55E] hover:text-[#16a34a] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
      ) : (
        <FileDown className="h-4 w-4" strokeWidth={2.4} />
      )}
      {loading ? "Generating..." : "Download comparison"}
    </button>
  );
}