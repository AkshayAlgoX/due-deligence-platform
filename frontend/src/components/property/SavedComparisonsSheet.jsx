"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Bookmark,
  Trash2,
  GitCompare,
  Loader2,
  BookmarkX,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useSavedComparisons } from "@/hooks/useSavedComparisons";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SavedComparisonsSheet({ isOpen, onClose }) {
  const router = useRouter();
  const sheetRef = useRef(null);

  const { comparisons, isLoading, isDeleting, fetchComparisons, remove } =
    useSavedComparisons({ autoFetch: false });

  // ── Fetch when sheet opens ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      fetchComparisons();
    }
  }, [isOpen, fetchComparisons]);

  // ── Keyboard + scroll lock ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // ── Backdrop click ────────────────────────────────────────────────────────
  const handleBackdropClick = (e) => {
    if (sheetRef.current && !sheetRef.current.contains(e.target)) {
      onClose();
    }
  };

  // ── Load a comparison ────────────────────────────────────────────────────
  const handleLoad = (comparison) => {
    const ids = comparison.propertyIds.join(",");
    router.push(`/dashboard/property-comparison?ids=${ids}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Saved comparisons"
    >
      {/* ── Sheet panel ───────────────────────────────────────────────────── */}
      <div
        ref={sheetRef}
        className="flex h-full w-full max-w-md flex-col bg-white shadow-[0_0_60px_rgba(0,0,0,0.2)] animate-in slide-in-from-right duration-300"
      >
        {/* ── Sheet header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 ring-1 ring-green-200">
              <Bookmark className="h-4 w-4 text-[#16a34a]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">
                Saved comparisons
              </h2>
              {!isLoading && (
                <p className="text-[11px] text-gray-400 font-medium">
                  {comparisons.length} saved
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:text-gray-700 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Sheet body ────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
              <p className="text-sm font-semibold text-gray-400">Loading saved comparisons...</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && comparisons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100">
                <BookmarkX className="h-7 w-7 text-gray-300" />
              </div>
              <div>
                <p className="text-base font-black text-gray-800">No saved comparisons</p>
                <p className="mt-1 text-sm text-gray-400 max-w-[240px]">
                  Compare properties and click "Save comparison" to keep them here.
                </p>
              </div>
            </div>
          )}

          {/* List */}
          {!isLoading && comparisons.length > 0 && (
            <div className="space-y-3">
              {comparisons.map((comparison) => (
                <div
                  key={comparison.id}
                  className="group relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-green-200 hover:shadow-md"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-gray-900">
                        {comparison.name}
                      </p>
                      {comparison.notes && (
                        <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
                          {comparison.notes}
                        </p>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => remove(comparison.id, comparison.name)}
                      disabled={isDeleting === comparison.id}
                      className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 cursor-pointer"
                      aria-label={`Delete ${comparison.name}`}
                    >
                      {isDeleting === comparison.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      )}
                    </button>
                  </div>

                  {/* Meta row */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Property count pill */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-black text-green-700 ring-1 ring-green-100">
                        <GitCompare className="h-3 w-3" strokeWidth={2.5} />
                        {comparison.propertyIds.length} properties
                      </span>
                      {/* Date */}
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                        <Clock className="h-3 w-3" strokeWidth={2} />
                        {formatDate(comparison.createdAt)}
                      </span>
                    </div>

                    {/* Load button */}
                    <button
                      type="button"
                      onClick={() => handleLoad(comparison)}
                      className="flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1.5 text-[11px] font-bold text-gray-700 transition hover:bg-[#22C55E] hover:text-white cursor-pointer"
                    >
                      Load
                      <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sheet footer ──────────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              router.push("/dashboard/saved-comparisons");
              onClose();
            }}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#22C55E] hover:text-[#16a34a] cursor-pointer"
          >
            View all saved comparisons →
          </button>
        </div>
      </div>
    </div>
  );
}