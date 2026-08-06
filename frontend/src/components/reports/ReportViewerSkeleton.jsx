"use client";

export default function ReportViewerSkeleton() {
  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-[#0d1117]">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 w-full bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#30363d] h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center gap-3">
          <div className="w-16 h-7 rounded-lg bg-gray-100 dark:bg-[#21262d] animate-pulse" />
          <div className="w-px h-5 bg-gray-200 dark:bg-[#30363d]" />
          <div className="flex-1 space-y-1.5">
            <div className="w-64 h-4 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse" />
            <div className="w-36 h-3 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-24 h-7 rounded-lg bg-gray-100 dark:bg-[#21262d] animate-pulse hidden sm:block" />
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#21262d] animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#21262d] animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#21262d] animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#21262d] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          {/* TOC skeleton */}
          <aside className="hidden lg:flex flex-col w-52 flex-shrink-0">
            <div className="sticky top-[80px] space-y-1.5">
              <div className="w-16 h-3 rounded-full bg-gray-200 dark:bg-[#21262d] animate-pulse mb-3" />
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded-lg bg-gray-100 dark:bg-[#21262d] animate-pulse"
                  style={{ opacity: 1 - i * 0.08 }}
                />
              ))}
            </div>
          </aside>

          {/* Sections skeleton */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Cover skeleton */}
            <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden">
              <div className="bg-gray-100 dark:bg-[#21262d] h-48 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="w-3/4 h-4 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse" />
                <div className="w-1/2 h-3 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse" />
              </div>
            </div>

            {/* Section skeletons */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 dark:bg-[#21262d] animate-pulse" />
                  <div className="w-24 h-3 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse" />
                </div>
                <div className="w-2/3 h-5 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse" />
                <div className="space-y-2">
                  <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse" />
                  <div className="w-5/6 h-3 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse" />
                  <div className="w-4/6 h-3 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse" />
                </div>
                {i % 2 === 0 && (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="h-20 rounded-xl bg-gray-50 dark:bg-[#21262d] animate-pulse"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}