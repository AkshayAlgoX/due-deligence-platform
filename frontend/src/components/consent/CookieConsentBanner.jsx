"use client";

import { Cookie } from "lucide-react";

/**
 * CookieConsentBanner — bottom-of-page banner shown to first-time visitors.
 * Clean, subtle, professional. Doesn't hijack the viewport.
 */
export default function CookieConsentBanner({ onAcceptAll, onRejectAll, onManage }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9997] px-4 pb-4 animate-in slide-in-from-bottom-4 duration-300"
      role="region"
      aria-label="Cookie consent"
    >
      <div className="mx-auto max-w-[1100px] rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">

          {/* Left: message */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100">
              <Cookie className="h-4 w-4 text-gray-600" strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 tracking-tight">
                Cookies on this site
              </p>
              <p className="mt-0.5 text-xs text-gray-600 leading-relaxed">
                We use essential cookies to keep you signed in. Analytics help us improve — your choice.
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onRejectAll}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
              Reject non-essential
            </button>

            <button
              type="button"
              onClick={onManage}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:border-gray-300"
            >
              Customize
            </button>

            <button
              type="button"
              onClick={onAcceptAll}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-gray-800"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}