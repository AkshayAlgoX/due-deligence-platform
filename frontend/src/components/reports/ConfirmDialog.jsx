// src/components/reports/ConfirmDialog.jsx
// Dashboard design tokens

"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isConfirming = false,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => cancelRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handle(e) {
      if (e.key === "Escape" && !isConfirming) onClose();
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, isConfirming, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-gray-900/50 dark:bg-black/70 backdrop-blur-md"
            onClick={!isConfirming ? onClose : undefined}
            aria-hidden="true"
          />

          <motion.div
            key="dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md rounded-2xl border overflow-hidden bg-white dark:bg-[#161b22] border-gray-100 dark:border-[#30363d] shadow-2xl">

              {/* Header */}
              <div className="relative flex items-start gap-4 px-6 pt-6 pb-5">
                {isDanger && (
                  <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                    <AlertTriangle size={20} strokeWidth={2} className="text-red-600 dark:text-red-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0 pt-0.5">
                  <h2
                    id="confirm-title"
                    className="text-lg font-bold text-gray-900 dark:text-[#e6edf3] leading-tight tracking-tight"
                  >
                    {title}
                  </h2>
                  {description && (
                    <p
                      id="confirm-description"
                      className="mt-2 text-sm text-gray-600 dark:text-[#7d8590] leading-relaxed"
                    >
                      {description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={!isConfirming ? onClose : undefined}
                  disabled={isConfirming}
                  aria-label="Close dialog"
                  className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 dark:text-[#7d8590] hover:text-gray-700 dark:hover:text-[#e6edf3] hover:bg-gray-100 dark:hover:bg-[#1c2128] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/40"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 dark:bg-[#30363d]" />

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-gray-50/50 dark:bg-[#1c2128]">
                <button
                  ref={cancelRef}
                  type="button"
                  onClick={onClose}
                  disabled={isConfirming}
                  className="h-10 px-5 rounded-xl text-sm font-semibold text-gray-700 dark:text-[#e6edf3] bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#22282f] hover:border-gray-300 dark:hover:border-[#3a424c] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/50"
                >
                  {cancelLabel}
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isConfirming}
                  className={[
                    "flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold transition-all duration-150",
                    "focus:outline-none focus-visible:ring-2",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    isDanger
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_10px_30px_rgba(220,38,38,0.35)] hover:shadow-[0_10px_35px_rgba(220,38,38,0.5)] hover:scale-[1.02] focus-visible:ring-red-500/50"
                      : "bg-gradient-to-br from-[#22C55E] to-[#16a34a] text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] hover:scale-[1.02] focus-visible:ring-[#22C55E]/50",
                  ].join(" ")}
                >
                  {isConfirming && (
                    <Loader2 size={14} strokeWidth={2.5} className="animate-spin" aria-hidden="true" />
                  )}
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}