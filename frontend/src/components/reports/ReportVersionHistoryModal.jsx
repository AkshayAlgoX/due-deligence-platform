"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { History, X, ExternalLink, FileText, Loader2 } from "lucide-react";
import reportService from "@/services/reportService";

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusChip({ status, t }) {
  const meta = {
    COMPLETED: { color: "#22C55E", bg: "rgba(34,197,94,0.1)", key: "report.status.completed" },
    GENERATING: { color: "#3B82F6", bg: "rgba(59,130,246,0.1)", key: "report.status.generating" },
    PENDING: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", key: "report.status.pending" },
    FAILED: { color: "#EF4444", bg: "rgba(239,68,68,0.1)", key: "report.status.failed" },
  };
  const s = meta[status] || { color: "#7d8590", bg: "rgba(125,133,144,0.1)", key: "report.status.unknown" };
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {t(s.key)}
    </span>
  );
}

export default function ReportVersionHistoryModal({
  isOpen,
  onClose,
  currentReport,
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const overlayRef = useRef(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !currentReport?.propertyId) return;
    setLoading(true);
    setError(null);
    reportService
      .listByProperty(currentReport.propertyId)
      .then((data) => {
        const sorted = (data || []).sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
        setVersions(sorted);
      })
      .catch(() => setError(t("report.versionHistory.error")))
      .finally(() => setLoading(false));
  }, [isOpen, currentReport?.propertyId, t]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-[#30363d] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#21262d] flex items-center justify-center">
              <History className="w-4 h-4 text-gray-500 dark:text-[#7d8590]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 dark:text-[#e6edf3]">
                {t("report.versionHistory.title")}
              </h2>
              <p className="text-[12px] text-gray-400 dark:text-[#6e7681]">
                {currentReport?.propertyAddress || ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#6e7681] hover:bg-gray-100 dark:hover:bg-[#21262d] transition-all duration-150"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400 dark:text-[#6e7681]" strokeWidth={2} />
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <p className="text-[13px] text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && versions.length === 0 && (
            <div className="p-8 text-center">
              <FileText className="w-8 h-8 text-gray-300 dark:text-[#30363d] mx-auto mb-2" />
              <p className="text-[13px] text-gray-400 dark:text-[#6e7681]">
                {t("report.versionHistory.empty")}
              </p>
            </div>
          )}

          {!loading && !error && versions.length > 0 && (
            <div className="divide-y divide-gray-50 dark:divide-[#30363d]/50">
              {versions.map((v) => {
                const isCurrent = v.id === currentReport?.id;
                return (
                  <div
                    key={v.id}
                    className={`px-6 py-4 flex items-center justify-between gap-3 transition-colors duration-150 ${
                      isCurrent
                        ? "bg-blue-50/50 dark:bg-blue-900/10"
                        : "hover:bg-gray-50/50 dark:hover:bg-[#21262d]/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#21262d] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-black text-gray-600 dark:text-[#7d8590]">
                          v{v.version}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <StatusChip status={v.status} t={t} />
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                              {t("report.versionHistory.current")}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-gray-400 dark:text-[#6e7681]">
                          {formatDate(v.completedAt || v.createdAt)}
                        </p>
                      </div>
                    </div>
                    {!isCurrent && v.status === "COMPLETED" && (
                      <button
                        onClick={() => {
                          onClose();
                          router.push(`/reports/${v.id}`);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-gray-600 dark:text-[#7d8590] hover:bg-gray-100 dark:hover:bg-[#21262d] border border-gray-200 dark:border-[#30363d] transition-all duration-150"
                      >
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                        {t("report.versionHistory.view")}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}