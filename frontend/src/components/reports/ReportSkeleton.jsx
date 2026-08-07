// frontend/src/components/reports/ReportSkeleton.jsx
"use client";

/**
 * ReportSkeleton — shimmer loading state for the My Reports list.
 * Renders N skeleton rows matching the ReportCard layout.
 *
 * Zero-runtime: no state, no framer-motion. Pure CSS animation for perf.
 *
 * Props:
 *   count — number of skeleton rows to render (default: 5)
 */
export default function ReportSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5"
        >
          <div className="flex items-start gap-4">
            {/* Icon placeholder */}
            <div className="w-11 h-11 rounded-lg bg-gray-100 dark:bg-[#21262d] animate-pulse flex-shrink-0" />

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2.5">
              {/* Title */}
              <div className="h-4 rounded bg-gray-100 dark:bg-[#21262d] animate-pulse w-3/4" />
              {/* Subtitle */}
              <div className="h-3 rounded bg-gray-100 dark:bg-[#21262d] animate-pulse w-1/2" />
              {/* Meta chips */}
              <div className="flex gap-2 pt-1">
                <div className="h-5 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse w-20" />
                <div className="h-5 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse w-16" />
                <div className="h-5 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse w-24" />
              </div>
            </div>

            {/* Action button placeholder */}
            <div className="w-24 h-9 rounded-lg bg-gray-100 dark:bg-[#21262d] animate-pulse flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}