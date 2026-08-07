// frontend/src/components/reports/ReportGeneratingModal.jsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { getStatusMeta } from "@/utils/reportUtils";

/**
 * ReportGeneratingModal — full-screen modal that shows report generation progress.
 *
 * Renders via createPortal(document.body) so it escapes any parent stacking context.
 *
 * States shown:
 *   PENDING    → "Queued for generation"
 *   GENERATING → "Analyzing property data" (with animated progress bar)
 *   COMPLETED  → "Report ready" + auto-redirect after 1.5s
 *   FAILED     → error message + retry button
 *
 * Props:
 *   open       — boolean, controls visibility
 *   status     — current status string
 *   error      — error message (if FAILED)
 *   reportId   — id of the report being generated (used for redirect)
 *   onClose    — called when user closes modal (only allowed on terminal states)
 *   onRedirect — called when redirect should happen (COMPLETED state, after 1.5s)
 *   onRetry    — called when user clicks retry (FAILED state)
 */
export default function ReportGeneratingModal({
  open,
  status,
  error,
  reportId,
  onClose,
  onRedirect,
  onRetry,
}) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-redirect 1.5s after COMPLETED
  useEffect(() => {
    if (status === "COMPLETED" && typeof onRedirect === "function") {
      const timer = setTimeout(() => {
        onRedirect(reportId);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, reportId, onRedirect]);

  if (!mounted || !open) return null;

  const isTerminal = status === "COMPLETED" || status === "FAILED";
  const isFailed = status === "FAILED";
  const isCompleted = status === "COMPLETED";
  const isInProgress = status === "PENDING" || status === "GENERATING";

  const statusMeta = getStatusMeta(status);

  const modalContent = (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={isTerminal ? onClose : undefined}
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] shadow-2xl overflow-hidden"
        >
          {/* ── Close button (only visible on terminal states) ── */}
          {isTerminal && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-[#e6edf3] hover:bg-gray-100 dark:hover:bg-[#21262d] transition-colors"
              aria-label={t("common.close", "Close")}
            >
              <X className="w-4 h-4" strokeWidth={2.25} />
            </button>
          )}

          {/* ── Content ── */}
          <div className="p-8 text-center">
            {/* Icon state */}
            <div className="flex justify-center mb-5">
              {isInProgress && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${statusMeta.color}15`,
                  }}
                >
                  <FileText
                    className="w-8 h-8"
                    style={{ color: statusMeta.color }}
                    strokeWidth={2}
                  />
                </motion.div>
              )}

              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-500/15"
                >
                  <CheckCircle2
                    className="w-9 h-9 text-green-600 dark:text-green-400"
                    strokeWidth={2}
                  />
                </motion.div>
              )}

              {isFailed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-500/15"
                >
                  <AlertCircle
                    className="w-9 h-9 text-red-600 dark:text-red-400"
                    strokeWidth={2}
                  />
                </motion.div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3] mb-2">
              {isInProgress &&
                t("report.modal.generatingTitle", "Generating your report")}
              {isCompleted && t("report.modal.completedTitle", "Report ready!")}
              {isFailed &&
                t("report.modal.failedTitle", "Something went wrong")}
            </h2>

            {/* Body text */}
            <p className="text-sm text-gray-600 dark:text-[#c9d1d9] mb-6 leading-relaxed">
              {status === "PENDING" &&
                t(
                  "report.modal.pendingBody",
                  "Your report is queued and will start shortly."
                )}
              {status === "GENERATING" &&
                t(
                  "report.modal.generatingBody",
                  "Analyzing property data, computing risk factors, and building your 8-section report. This typically takes 10–30 seconds."
                )}
              {isCompleted &&
                t(
                  "report.modal.completedBody",
                  "Redirecting you to the full report…"
                )}
              {isFailed &&
                (error ||
                  t(
                    "report.modal.failedBody",
                    "We couldn't complete your report. Please try again."
                  ))}
            </p>

            {/* Status pill (in-progress only) */}
            {isInProgress && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot} animate-pulse`}
                />
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest ${statusMeta.text}`}
                >
                  {t(statusMeta.labelKey, statusMeta.defaultLabel)}
                </span>
              </div>
            )}

            {/* Animated progress bar (in-progress only) */}
            {isInProgress && (
              <div className="h-1 rounded-full bg-gray-100 dark:bg-[#21262d] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: statusMeta.color }}
                  initial={{ width: "0%" }}
                  animate={{ width: ["10%", "90%"] }}
                  transition={{
                    duration: 15,
                    ease: "easeOut",
                  }}
                />
              </div>
            )}

            {/* Retry button (FAILED only) */}
            {isFailed && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-[#e6edf3] border border-gray-200 dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors"
                >
                  {t("report.modal.dismiss", "Dismiss")}
                </button>
                {typeof onRetry === "function" && (
                  <button
                    onClick={onRetry}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                  >
                    {t("report.modal.retry", "Try again")}
                  </button>
                )}
              </div>
            )}

            {/* Completed: loading spinner while redirecting */}
            {isCompleted && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-[#7d8590]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t("report.modal.redirecting", "Opening report…")}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}