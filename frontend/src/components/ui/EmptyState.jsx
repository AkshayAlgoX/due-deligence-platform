"use client";

import { Inbox } from "lucide-react";

/**
 * Reusable empty state component.
 *
 * Usage:
 *   <EmptyState
 *     icon={SearchX}
 *     title="No properties found"
 *     description="Try adjusting your filters."
 *     action={{ label: "Add property", onClick: () => setOpen(true) }}
 *   />
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "Get started by adding your first item.",
  action = null,
  size = "default", // "default" | "compact"
}) {
  const isCompact = size === "compact";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        isCompact ? "py-8 px-4" : "py-16 px-6"
      }`}
    >
      <div
        className={`rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 ${
          isCompact ? "w-12 h-12" : "w-16 h-16"
        }`}
      >
        <Icon
          className={`text-gray-300 ${isCompact ? "h-5 w-5" : "h-7 w-7"}`}
          strokeWidth={1.5}
        />
      </div>

      <p
        className={`font-bold text-gray-800 ${
          isCompact ? "text-sm" : "text-lg"
        }`}
      >
        {title}
      </p>

      {description && (
        <p
          className={`mt-1.5 text-gray-500 max-w-sm ${
            isCompact ? "text-xs" : "text-sm"
          }`}
        >
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition hover:bg-[#16a34a] hover:scale-[1.02] active:scale-[0.98]"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
}