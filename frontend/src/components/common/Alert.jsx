"use client";

/**
 * Alert — dismissible success / error / info banner.
 */
export default function Alert({ type = "info", message, onDismiss }) {
  if (!message) return null;

  const styles = {
    success: "bg-green-50 border-green-300 text-green-800",
    error:   "bg-red-50  border-red-300   text-red-800",
    info:    "bg-blue-50 border-blue-300  text-blue-800",
  };

  const icons = {
    success: "✓",
    error:   "✕",
    info:    "ℹ",
  };

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 rounded-lg border px-4 py-3 text-sm
        animate-in fade-in slide-in-from-top-2 duration-300
        ${styles[type]}
      `}
    >
      <span className="font-bold text-base leading-none mt-0.5">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="ml-auto opacity-60 hover:opacity-100 transition-opacity text-base leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}
