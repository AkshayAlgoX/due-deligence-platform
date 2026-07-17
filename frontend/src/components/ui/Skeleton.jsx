"use client";

/**
 * Reusable skeleton loader components.
 * Way more premium than spinners — shows layout hint while loading.
 */

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
    />
  );
}

/** For dashboard KPI cards */
export function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-4 w-24" />
      <Skeleton className="mt-2 h-8 w-32" />
    </div>
  );
}

/** For property result cards in the grid */
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-full" />
        <div className="my-3 h-px bg-gray-100" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

/** For property hero card */
export function PropertyHeroSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <Skeleton className="h-[380px] rounded-none" />
        <div className="p-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-3 h-8 w-full" />
          <Skeleton className="mt-2 h-8 w-3/4" />
          <div className="my-6 h-px bg-gray-100" />
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-4" />
                <Skeleton className="mt-2 h-3 w-20" />
                <Skeleton className="mt-1 h-5 w-16" />
              </div>
            ))}
          </div>
          <div className="my-6 h-px bg-gray-100" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-40" />
            <Skeleton className="h-11 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}