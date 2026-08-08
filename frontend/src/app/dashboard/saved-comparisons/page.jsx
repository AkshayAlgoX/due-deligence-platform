"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Bookmark,
  Trash2,
  GitCompare,
  Loader2,
  BookmarkX,
  Clock,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";
import { useSavedComparisons } from "@/hooks/useSavedComparisons";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

// Now takes locale so Hindi shows Hindi month names
function formatDate(dateStr, locale = "en-IN") {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SavedComparisonsPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const {
    comparisons,
    isLoading,
    isDeleting,
    error,
    fetchComparisons,
    remove,
  } = useSavedComparisons({ autoFetch: true });

  useEffect(() => {
    document.title = t("savedComparisons.pageTitle");
  }, [t]);

  const filtered = comparisons.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.notes || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleLoad = (comparison) => {
    const ids = comparison.propertyIds.join(",");
    router.push(`/dashboard/property-comparison?ids=${ids}`);
  };

  // Fall back to en-IN if language is missing
  const dateLocale = i18n.language || "en-IN";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Breadcrumbs />

      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-[#0d2818] ring-1 ring-green-200 dark:ring-green-900/50">
              <Bookmark
                className="h-5 w-5 text-[#16a34a]"
                strokeWidth={2}
              />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-[#e6edf3] tracking-tight">
                {t("savedComparisons.title")}
              </h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-[#7d8590]">
                {isLoading
                  ? t("common.loading")
                  : t("savedComparisons.countLabel", {
                      count: comparisons.length,
                    })}
              </p>
            </div>
          </div>

        </div>

        {/* Search */}
        {comparisons.length > 0 && (
          <div className="mt-5 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 dark:text-[#484f58]"
              strokeWidth={2}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("savedComparisons.searchPlaceholder")}
              className="w-full rounded-xl border border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#0d1117] py-3 pl-10 pr-4 text-sm font-semibold text-gray-900 dark:text-[#e6edf3] placeholder:text-gray-300 dark:placeholder:text-[#6e7681] outline-none transition focus:border-[#22C55E] focus:bg-white dark:focus:bg-[#161b22] focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30"
            />
          </div>
        )}
      </div>

      {/* ── Error state ────────────────────────────────────────────── */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-[#2d1214] px-6 py-5 text-sm font-semibold text-red-700 dark:text-red-400">
          {error} —{" "}
          <button
            onClick={fetchComparisons}
            className="underline hover:no-underline cursor-pointer"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {/* ── Loading skeleton ───────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-sm animate-pulse"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 rounded bg-gray-200 dark:bg-[#30363d]" />
                  <div className="h-3 w-72 rounded bg-gray-100 dark:bg-[#1c2128]" />
                </div>
                <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-[#1c2128]" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-6 w-24 rounded-full bg-gray-100 dark:bg-[#1c2128]" />
                <div className="h-4 w-20 rounded bg-gray-100 dark:bg-[#1c2128]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state (no saved comparisons at all) ──────────────── */}
      {!isLoading && comparisons.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] py-24 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#30363d] mb-4">
            <BookmarkX className="h-7 w-7 text-gray-300 dark:text-[#484f58]" />
          </div>
          <p className="text-lg font-black text-gray-800 dark:text-[#e6edf3]">
            {t("savedComparisons.emptyTitle")}
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-[#6e7681] max-w-xs">
            {t("savedComparisons.emptyDesc")}
          </p>
          <button
            onClick={() => router.push("/dashboard/property-search")}
            className="mt-6 flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition hover:bg-[#16a34a] cursor-pointer"
          >
            <GitCompare className="h-4 w-4" />
            {t("savedComparisons.startComparing")}
          </button>
        </div>
      )}

      {/* ── No search results ──────────────────────────────────────── */}
      {!isLoading && comparisons.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] py-16 text-center shadow-sm">
          <Search className="h-8 w-8 text-gray-200 dark:text-[#30363d] mb-3" />
          <p className="text-base font-black text-gray-700 dark:text-[#e6edf3]">
            {t("savedComparisons.noResults", { query: search })}
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-sm font-semibold text-[#22C55E] hover:underline cursor-pointer"
          >
            {t("property.search.clearSearch")}
          </button>
        </div>
      )}

      {/* ── Comparisons list ───────────────────────────────────────── */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((comparison) => (
            <div
              key={comparison.id}
              className="group rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-sm transition hover:border-green-200 dark:hover:border-green-800 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: info */}
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black text-gray-900 dark:text-[#e6edf3] truncate">
                    {comparison.name}
                  </p>
                  {comparison.notes && (
                    <p className="mt-1 text-sm text-gray-400 dark:text-[#6e7681] line-clamp-2">
                      {comparison.notes}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-[#0d2818] px-2.5 py-1 text-[10px] font-black text-green-700 dark:text-green-400 ring-1 ring-green-100 dark:ring-green-900/50">
                      <GitCompare className="h-3 w-3" strokeWidth={2.5} />
                      {t("savedComparisons.propertyCount", {
                        count: comparison.propertyIds.length,
                      })}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#6e7681] font-medium">
                      <Clock className="h-3 w-3" strokeWidth={2} />
                      {t("savedComparisons.savedOn", {
                        date: formatDate(comparison.createdAt, dateLocale),
                      })}
                    </span>
                    {comparison.updatedAt !== comparison.createdAt && (
                      <span className="text-[10px] text-gray-300 dark:text-[#484f58] font-medium">
                        ·{" "}
                        {t("savedComparisons.updatedOn", {
                          date: formatDate(comparison.updatedAt, dateLocale),
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => remove(comparison.id, comparison.name)}
                    disabled={isDeleting === comparison.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 dark:text-[#6e7681] transition hover:bg-red-50 dark:hover:bg-[#2d1214] hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50 cursor-pointer"
                    aria-label={t("savedComparisons.deleteAria", {
                      name: comparison.name,
                    })}
                  >
                    {isDeleting === comparison.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoad(comparison)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#22C55E] px-4 py-2 text-xs font-bold text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] transition hover:bg-[#16a34a] hover:shadow-[0_8px_20px_rgba(34,197,94,0.4)] cursor-pointer"
                  >
                    {t("savedComparisons.loadComparison")}
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}