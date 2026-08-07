"use client";

/**
 * RiskHistorySkeleton — Loading placeholder for RiskHistorySection.
 *
 * Matches the layout of the loaded state (metadata + chart + timeline)
 * so the transition feels seamless — no layout shift.
 *
 * Design inspired by: Linear, Vercel, GitHub loading skeletons.
 */
export default function RiskHistorySkeleton() {
  return (
    <section className="mb-8">
      {/* Header skeleton */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#161b22] animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded bg-gray-100 dark:bg-[#161b22] animate-pulse" />
          <div className="h-3 w-56 rounded bg-gray-100 dark:bg-[#161b22] animate-pulse" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Metadata bar skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 dark:bg-[#30363d] rounded-xl overflow-hidden border border-gray-200 dark:border-[#30363d]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#0d1117] px-5 py-4">
              <div className="h-2.5 w-16 rounded bg-gray-100 dark:bg-[#161b22] animate-pulse mb-3" />
              <div className="h-7 w-20 rounded bg-gray-100 dark:bg-[#161b22] animate-pulse mb-2" />
              <div className="h-2.5 w-24 rounded bg-gray-100 dark:bg-[#161b22] animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-6">
          <div className="mb-4 space-y-1.5">
            <div className="h-4 w-40 rounded bg-gray-100 dark:bg-[#161b22] animate-pulse" />
            <div className="h-3 w-60 rounded bg-gray-100 dark:bg-[#161b22] animate-pulse" />
          </div>
          <div className="relative h-[240px] rounded-lg bg-gray-50 dark:bg-[#161b22] overflow-hidden">
            {/* Fake chart bars */}
            <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
              {[40, 55, 45, 60, 50, 65, 55].map((h, i) => (
                <div
                  key={i}
                  className="w-6 rounded-t bg-gray-200 dark:bg-[#30363d] animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Timeline skeleton */}
        <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-[#21262d] space-y-1.5">
            <div className="h-4 w-44 rounded bg-gray-100 dark:bg-[#161b22] animate-pulse" />
            <div className="h-3 w-52 rounded bg-gray-100 dark:bg-[#161b22] animate-pulse" />
          </div>
          <div className="px-6 py-5 space-y-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-[#30363d] animate-pulse" />
                  {i < 2 && (
                    <div className="w-px flex-1 bg-gray-100 dark:bg-[#21262d] mt-1" />
                  )}
                </div>
                <div className="flex-1 space-y-2 pb-4">
                  <div className="h-3 w-24 rounded bg-gray-100 dark:bg-[#161b22] animate-pulse" />
                  <div className="h-4 w-48 rounded bg-gray-100 dark:bg-[#161b22] animate-pulse" />
                  <div className="h-3 w-full max-w-md rounded bg-gray-100 dark:bg-[#161b22] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}