"use client";

import { Cookie } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CookieConsentBanner({ onAcceptAll, onRejectAll, onManage }) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9997] px-4 pb-4 animate-in slide-in-from-bottom-4 duration-300"
      role="region"
      aria-label={t("cookies.banner.ariaLabel")}
    >
      <div className="mx-auto max-w-[1100px] rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-[0_20px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">

          {/* Left: message */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-[#1c2128] ring-1 ring-gray-100 dark:ring-[#30363d]">
              <Cookie className="h-4 w-4 text-gray-600 dark:text-[#7d8590]" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight">
                {t("cookies.banner.title")}
              </p>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-[#7d8590] leading-relaxed">
                {t("cookies.banner.description")}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onRejectAll}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 dark:text-[#7d8590] transition hover:bg-gray-50 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-[#e6edf3]"
            >
              {t("cookies.banner.rejectNonEssential")}
            </button>

            <button
              type="button"
              onClick={onManage}
              className="rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-4 py-2 text-sm font-semibold text-gray-700 dark:text-[#e6edf3] transition hover:bg-gray-50 dark:hover:bg-[#1c2128] hover:border-gray-300 dark:hover:border-[#484f58]"
            >
              {t("cookies.banner.customize")}
            </button>

            <button
              type="button"
              onClick={onAcceptAll}
              className="rounded-lg bg-gray-900 dark:bg-[#e6edf3] px-5 py-2 text-sm font-bold text-white dark:text-[#0d1117] transition hover:bg-gray-800 dark:hover:bg-white"
            >
              {t("cookies.banner.acceptAll")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}