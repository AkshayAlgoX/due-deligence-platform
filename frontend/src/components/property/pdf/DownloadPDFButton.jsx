// frontend/src/components/property/pdf/DownloadPDFButton.jsx
"use client";

import { useState, useEffect } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAggregatedProperty } from "@/services/aggregationService";
import { getPropertyRisk } from "@/services/propertyService";

/**
 * DownloadPDFButton
 *
 * Dynamically imports @react-pdf/renderer (SSR-safe).
 * On click:
 *   1. Fetches aggregated data + risk score in parallel
 *   2. Renders PropertyPDFDocument to blob
 *   3. Triggers browser download
 *
 * Props:
 *   property - PropertyResponse (required)
 */
export default function DownloadPDFButton({ property }) {
  const [loading, setLoading] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  // Lazy-loaded PDF modules — only loaded once on first click
  const [pdfLib, setPdfLib] = useState(null);

  // Pre-load @react-pdf/renderer as soon as the button mounts.
  // This hides the ~800ms dynamic import delay from the user click.
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
      // Load PDF lib if pre-load failed
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

      // Fetch aggregated + risk in parallel
      const [aggregated, risk] = await Promise.allSettled([
        getAggregatedProperty(property.id),
        getPropertyRisk(property.id),
      ]);

      const aggregatedData = aggregated.status === "fulfilled" ? aggregated.value : null;
      const riskData       = risk.status       === "fulfilled" ? risk.value       : null;

      if (!aggregatedData && !riskData) {
        toast.error("Could not load property data", {
          description: "Please try again in a moment.",
        });
        return;
      }

      // Generate PDF blob
      const blob = await pdf(
        <PDFDocument
          property={property}
          aggregated={aggregatedData}
          risk={riskData}
        />
      ).toBlob();

      // Trigger download
      const url      = URL.createObjectURL(blob);
      const filename = `due-diligence-${property.id}-${property.city ?? "property"}.pdf`
        .toLowerCase()
        .replace(/\s+/g, "-");

      const link = document.createElement("a");
      link.href     = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Report downloaded", {
        description: `${filename} saved to your downloads folder.`,
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Download failed", {
        description: err?.message ?? "Could not generate the report. Try again.",
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
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all duration-150 hover:border-[#22C55E] hover:text-[#16a34a] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      title={pdfReady ? "Download PDF report" : "Preparing PDF engine..."}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.4} />
      ) : (
        <FileDown className="h-3 w-3" strokeWidth={2.4} />
      )}
      {loading ? "Generating..." : "Download report"}
    </button>
  );
}