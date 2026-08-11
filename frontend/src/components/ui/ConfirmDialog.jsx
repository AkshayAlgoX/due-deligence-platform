"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

/**
 * Generic confirmation dialog for destructive actions.
 *
 * Usage:
 *   <ConfirmDialog
 *     isOpen={showDelete}
 *     onClose={() => setShowDelete(false)}
 *     onConfirm={handleDelete}
 *     title="Delete property?"
 *     description="This action cannot be undone. All data related to this property will be permanently removed."
 *     confirmLabel="Delete"
 *     variant="danger"
 *   />
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger", // "danger" | "warning" | "info"
  loading = false,
}) {
  // Close on Esc
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-red-50 dark:bg-red-500/15",
      iconColor: "text-red-600 dark:text-red-400",
      button:
        "bg-red-600 hover:bg-red-700 shadow-[0_8px_20px_rgba(220,38,38,0.3)]",
    },
    warning: {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      button:
        "bg-amber-600 hover:bg-amber-700 shadow-[0_8px_20px_rgba(217,119,6,0.3)]",
    },
    info: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      button:
        "bg-blue-600 hover:bg-blue-700 shadow-[0_8px_20px_rgba(37,99,235,0.3)]",
    },
  }[variant];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${variantStyles.iconBg}`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${variantStyles.iconColor}`}
                strokeWidth={2.5}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">{title}</h3>
              <p className="mt-1.5 text-sm text-gray-600 dark:text-[#7d8590] leading-relaxed">
                {description}
              </p>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-[#7d8590] hover:text-gray-600 dark:hover:text-[#e6edf3] transition"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-gray-100 dark:border-[#30363d] px-6 py-4 bg-gray-50 dark:bg-[#1c2128] rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-[#e6edf3] transition hover:bg-gray-50 dark:hover:bg-[#30363d] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition ${variantStyles.button} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}