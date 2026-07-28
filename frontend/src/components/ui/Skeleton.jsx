"use client";

/**
 * Reusable skeleton loader components.
 * Match the shape of the real content — never generic bars.
 */

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-100 ${className}`}
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
      <Skeleton className="mt-6 h-3.5 w-24" />
      <Skeleton className="mt-2 h-8 w-32" />
    </div>
  );
}

/** For property result cards in the grid */
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-5">
        <div className="flex items-start gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-4 flex-1" />
        </div>
        <Skeleton className="ml-7 mt-2 h-3 w-2/3" />
        <div className="my-4 h-px bg-gray-100" />
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
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
          <Skeleton className="h-3 w-24" />
          <div className="mt-3 flex items-start justify-between gap-6">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-3/4" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="mt-5 flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
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
        </div>
      </div>
    </div>
  );
}

/** For profile page — inline info rows */
export function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-12">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-3 w-48" />
      </div>

      <div>
        <Skeleton className="mb-4 h-3 w-20" />
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** For inline text — single line of body copy */
export function TextSkeleton({ lines = 1, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/** For table rows */
export function TableRowSkeleton({ columns = 4 }) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

/** For avatar circles */
export function AvatarSkeleton({ size = "default" }) {
  const sizes = { sm: "h-8 w-8", default: "h-10 w-10", lg: "h-14 w-14" };
  return <Skeleton className={`${sizes[size]} rounded-full`} />;
}