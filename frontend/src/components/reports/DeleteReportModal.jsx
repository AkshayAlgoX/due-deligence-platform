"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, X, AlertTriangle } from "lucide-react";

export default function DeleteReportModal({
  isOpen,
  onClose,
  onConfirm,
  report,
  isLoading = false,
}) {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  const isConfirmed = confirmText === "DELETE";

  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && isConfirmed && !isLoading) onConfirm();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isConfirmed, isLoading, onClose, onConfirm]);

  if (!isOpen) return null;

  const address = report?.propertyAddress || report?.title || "this report";

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
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={2} />
          </div>

          <h2 className="text-[17px] font-bold text-gray-900 dark:text-[#e6edf3] mb-2">
            {t("report.list.deleteModal.title")}
          </h2>
          <p className="text-[13px] text-gray-500 dark:text-[#7d8590] leading-relaxed mb-4">
            {t("report.list.deleteModal.body", { address })}
          </p>

          <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/20 px-4 py-3 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[12px] text-red-700 dark:text-red-400 leading-relaxed">
              All sections, risk data, and generated content will be permanently
              removed from the system.
            </p>
          </div>

          <label className="block">
            <p className="text-[12px] font-semibold text-gray-600 dark:text-[#7d8590] mb-2">
              {t("report.list.deleteModal.confirmPrompt")}
            </p>
            <input
              ref={inputRef}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2.5 rounded-xl border text-[13px] font-mono bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3] placeholder-gray-300 dark:placeholder-[#6e7681] transition-all duration-150 focus:outline-none focus:ring-2"
              style={{
                borderColor: isConfirmed
                  ? "rgba(239,68,68,0.5)"
                  : "rgba(0,0,0,0.1)",
              }}
            />
          </label>
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
            disabled={!isConfirmed || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-red-600 hover:bg-red-700 text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
            {t("report.list.deleteModal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}