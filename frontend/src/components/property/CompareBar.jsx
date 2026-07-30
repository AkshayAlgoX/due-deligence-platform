// frontend/src/components/property/CompareBar.jsx
"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { GitCompare, X, Plus } from "lucide-react";
import { getPropertyImage } from "@/constants/propertyImages";

export default function CompareBar({
  compareList = [],
  onRemove,
  onClear,
}) {
  const { t }   = useTranslation();
  const router  = useRouter();
  const count   = compareList.length;
  const visible = count > 0;

  const handleCompare = () => {
    if (count < 2) return;
    const ids = compareList.map((p) => p.id).join(",");
    router.push(`/dashboard/property-comparison?ids=${ids}`);
  };

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        transition-transform duration-300 ease-out
        ${visible ? "translate-y-0" : "translate-y-full"}
      `}
      aria-hidden={!visible}
    >
      <div className="mx-auto max-w-[1400px] px-4 pb-4">
        <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.5)] px-5 py-4">
          <div className="flex items-center gap-4">

            {/* ── Icon + label ── */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 dark:bg-[#0d2818] ring-1 ring-green-200 dark:ring-green-900">
                <GitCompare
                  className="h-4.5 w-4.5 text-[#16a34a] dark:text-green-400"
                  strokeWidth={2}
                />
              </div>
              <div>
                {/* "Compare" section label */}
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
                  {t("property.comparison.compareLabel")}
                </p>
                {/* "X of 3 selected" */}
                <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3] leading-none">
                  {t("property.comparison.selectedCount", { count })}
                </p>
              </div>
            </div>

            <div className="h-10 w-px bg-gray-100 dark:bg-[#30363d] flex-shrink-0" />

            {/* ── Property slots ── */}
            <div className="flex flex-1 items-center gap-3 overflow-hidden">
              {compareList.map((p) => {
                const thumb = getPropertyImage(p);
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-2.5 rounded-xl border border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#1c2128] px-3 py-2 min-w-0 flex-shrink-0"
                  >
                    {/* Thumbnail */}
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-[#30363d]">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={p.address}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#1c2128] dark:to-[#30363d]" />
                      )}
                    </div>

                    {/* Address + city */}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-[#e6edf3] truncate max-w-[140px]">
                        {p.address}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-[#7d8590] truncate">
                        {p.city}{p.state ? `, ${p.state}` : ""}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => onRemove(p)}
                      className="ml-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-gray-400 dark:text-[#7d8590] hover:bg-gray-200 dark:hover:bg-[#30363d] hover:text-gray-700 dark:hover:text-[#e6edf3] transition"
                      aria-label={t("property.comparison.removeProperty", {
                        address: p.address,
                      })}
                    >
                      <X className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                  </div>
                );
              })}

              {/* ── Empty placeholder slots ── */}
              {Array.from({ length: 3 - count }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex h-12 w-36 flex-shrink-0 items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 dark:border-[#30363d] text-gray-300 dark:text-[#6e7681]"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                  <span className="text-[11px] font-semibold">
                    {t("property.addProperty")}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Action buttons ── */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Clear */}
              <button
                onClick={onClear}
                className="rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-[#e6edf3] transition hover:bg-gray-50 dark:hover:bg-[#30363d] hover:border-gray-300 dark:hover:border-[#484f58]"
              >
                {t("common.clear")}
              </button>

              {/* Compare / minimum hint */}
              <button
                onClick={handleCompare}
                disabled={count < 2}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(34,197,94,0.35)] transition hover:shadow-[0_6px_20px_rgba(34,197,94,0.45)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
              >
                <GitCompare className="h-4 w-4" strokeWidth={2.5} />
                {count >= 2
                  ? t("property.comparison.compareCount", { count })
                  : t("property.comparison.selectMinimum")}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}