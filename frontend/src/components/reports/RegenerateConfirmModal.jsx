"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { useTranslation, Trans } from "react-i18next";
import { RefreshCw, X, AlertTriangle } from "lucide-react";

export default function RegenerateConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  report,
  isLoading = false,
}) {
  const { t } = useTranslation();
  const overlayRef = useRef(null);

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

  const currentVersion = report?.version ?? 1;
  const nextVersion = currentVersion + 1;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#6e7681] hover:bg-gray-100 dark:hover:bg-[#21262d] hover:text-gray-600 dark:hover:text-[#e6edf3] transition-all duration-150"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>

        <div className="px-6 pt-8 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
          </div>

          <h2 className="text-[17px] font-bold text-gray-900 dark:text-[#e6edf3] mb-2">
            {t("report.regenerate.title")}
          </h2>
          <p className="text-[13px] text-gray-500 dark:text-[#7d8590] leading-relaxed mb-4">
            <Trans
              i18nKey="report.regenerate.body"
              values={{ next: nextVersion, current: currentVersion }}
              components={{
                strong: (
                  <span className="font-semibold text-gray-700 dark:text-[#e6edf3]" />
                ),
              }}
            />
          </p>

          <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/20 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">
              {t("report.regenerate.warning")}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#0d1117]/30 flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 dark:text-[#7d8590] hover:bg-gray-100 dark:hover:bg-[#21262d] transition-all duration-150 disabled:opacity-50"
          >
            {t("report.regenerate.cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} />
                {t("report.regenerate.creating", { next: nextVersion })}
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} />
                {t("report.regenerate.confirm", { next: nextVersion })}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}