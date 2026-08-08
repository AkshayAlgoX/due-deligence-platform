"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Archive,
  X,
} from "lucide-react";
import { EXPORT_FORMATS, EXPORT_STAGES } from "@/utils/exportConstants";

export default function ExportProgressModal({
  isOpen,
  stage = EXPORT_STAGES.IDLE,
  percent = 0,
  format = EXPORT_FORMATS.PDF,
  onClose,
}) {
  const { t } = useTranslation();

  const isCompleted = stage === EXPORT_STAGES.COMPLETED;
  const isFailed = stage === EXPORT_STAGES.FAILED;
  const isActive = !isCompleted && !isFailed;

  // Auto-dismiss after 2s on success
  useEffect(() => {
    if (!isCompleted || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, [isCompleted, onClose]);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const getFormatIcon = () => {
    switch (format) {
      case EXPORT_FORMATS.EXCEL:
        return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      case EXPORT_FORMATS.ZIP:
        return <Archive className="w-8 h-8 text-amber-500" />;
      case EXPORT_FORMATS.PDF:
      default:
        return <FileText className="w-8 h-8 text-red-500" />;
    }
  };

  const getStageMessage = () => {
    switch (stage) {
      case EXPORT_STAGES.PREPARING:
        return t("export.progress.preparing", "Preparing document layout & sections...");
      case EXPORT_STAGES.FETCHING:
        return t("export.progress.fetching", "Fetching report risk data...");
      case EXPORT_STAGES.GENERATING:
        return t("export.progress.rendering", "Rendering graphics, tables & cover page...");
      case EXPORT_STAGES.DOWNLOADING:
        return t("export.progress.finalizing", "Finalizing binary stream & starting download...");
      case EXPORT_STAGES.COMPLETED:
        return t("export.ready.message", "Downloaded successfully");
      case EXPORT_STAGES.FAILED:
        return t("export.error.failed", "Failed to generate export file.");
      default:
        return t("export.generating", "Generating export file...");
    }
  };

  const getProgressBarColor = () => {
    if (isFailed) return "bg-red-500";
    if (isCompleted) return "bg-gradient-to-r from-[#22C55E] to-[#16a34a]";
    return "bg-gradient-to-r from-[#22C55E] to-[#16a34a]";
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        // Overlay
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center
            bg-black/60 backdrop-blur-sm"
          // Click overlay to close only if completed or failed
          onClick={(e) => {
            if (e.target === e.currentTarget && (isCompleted || isFailed) && onClose) {
              onClose();
            }
          }}
        >
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md mx-4
              bg-white dark:bg-[#161b22]
              border border-gray-200 dark:border-[#30363d]
              rounded-2xl shadow-2xl p-6"
          >
            {/* X Close Button — always visible */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4
                  w-7 h-7 rounded-lg flex items-center justify-center
                  text-gray-400 dark:text-[#7d8590]
                  hover:bg-gray-100 dark:hover:bg-[#1c2129]
                  hover:text-gray-600 dark:hover:text-[#e6edf3]
                  transition-all duration-200"
                title={t("common.close", "Close")}
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            )}

            <div className="flex flex-col items-center text-center">

              {/* Format Icon + Status Badge */}
              <div className="relative mb-5 flex items-center justify-center">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1c2129] shadow-inner">
                  {isCompleted
                    ? <CheckCircle2 className="w-8 h-8 text-[#22C55E]" strokeWidth={2} />
                    : getFormatIcon()
                  }
                </div>

                {/* Spinner badge — active state */}
                {isActive && (
                  <div className="absolute -bottom-1 -right-1
                    bg-[#22C55E] rounded-full p-1 text-white shadow-md">
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  </div>
                )}

                {/* Error badge */}
                {isFailed && (
                  <div className="absolute -bottom-1 -right-1
                    bg-red-500 rounded-full p-1 text-white shadow-md">
                    <AlertCircle className="w-4 h-4" strokeWidth={2} />
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
                {isCompleted
                  ? t("export.ready.title", "Export Ready")
                  : isFailed
                  ? t("export.error.title", "Export Error")
                  : t("export.generating", "Generating Export")}
              </h3>

              {/* Subtitle / Stage message */}
              <p className="text-sm text-gray-500 dark:text-[#7d8590]
                mt-1.5 mb-6 min-h-[36px]">
                {getStageMessage()}
              </p>

              {/* Progress Bar */}
              <div className="w-full mb-4">
                <div className="flex justify-between items-center
                  text-xs font-bold mb-2">
                  <span className="text-gray-400 dark:text-[#7d8590]
                    uppercase tracking-widest">
                    {t("export.progress.label", "Progress")}
                  </span>
                  <span className={`${
                    isFailed
                      ? "text-red-500"
                      : "text-[#22C55E]"
                  }`}>
                    {Math.round(percent)}%
                  </span>
                </div>

                {/* Track */}
                <div className="w-full h-2
                  bg-gray-200 dark:bg-[#30363d]
                  rounded-full overflow-hidden">
                  {/* Fill */}
                  <motion.div
                    className={`h-full rounded-full ${getProgressBarColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Auto-dismiss hint on success */}
              {isCompleted && (
                <p className="text-xs text-gray-400 dark:text-[#7d8590] mt-1">
                  {t("export.ready.autoDismiss", "Closing automatically...")}
                </p>
              )}

              {/* Manual close button — only on failure */}
              {isFailed && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl
                    font-medium text-sm
                    bg-gray-900 hover:bg-gray-800
                    dark:bg-[#1c2129] dark:hover:bg-[#30363d]
                    text-white dark:text-[#e6edf3]
                    transition-all duration-200"
                >
                  {t("common.close", "Close")}
                </button>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // createPortal — renders outside DOM tree, no z-index/overflow bugs
  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}