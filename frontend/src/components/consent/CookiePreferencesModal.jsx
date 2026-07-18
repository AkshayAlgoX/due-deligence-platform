"use client";

import { useEffect, useState } from "react";
import { X, ShieldCheck, BarChart3 } from "lucide-react";

function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
        ${checked ? "bg-gray-900" : "bg-gray-200"}
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform
          ${checked ? "translate-x-[22px]" : "translate-x-0.5"}
        `}
      />
    </button>
  );
}

export default function CookiePreferencesModal({
  open,
  onClose,
  onSave,
  onAcceptAll,
  onRejectAll,
  initialAnalytics = false,
}) {
  const [analytics, setAnalytics] = useState(initialAnalytics);

  useEffect(() => {
    if (open) {
      setAnalytics(initialAnalytics);
    }
  }, [open, initialAnalytics]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-prefs-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2
              id="cookie-prefs-title"
              className="text-lg font-bold text-gray-900 tracking-tight"
            >
              Cookie preferences
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              You control what data we collect.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <PreferenceRow
            title="Essential"
            description="Required for authentication, session management, and security. Cannot be disabled."
            icon={<ShieldCheck className="h-4 w-4 text-gray-700" strokeWidth={2.2} />}
            right={<Switch checked={true} disabled onChange={() => {}} />}
          />

          <PreferenceRow
            title="Analytics"
            description="Google Analytics 4 — anonymized page views and events. Helps us understand which features get used. Off by default."
            icon={<BarChart3 className="h-4 w-4 text-gray-700" strokeWidth={2.2} />}
            right={<Switch checked={analytics} onChange={setAnalytics} />}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
          <button
            type="button"
            onClick={onRejectAll}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition px-2 py-1"
          >
            Reject all
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onAcceptAll}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Accept all
            </button>

            <button
              type="button"
              onClick={() => onSave({ analytics })}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 transition"
            >
              Save choices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreferenceRow({ title, description, icon, right }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:border-gray-200 transition">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gray-50">
            {icon}
          </span>
          <p className="text-sm font-bold text-gray-900">{title}</p>
        </div>
        <p className="mt-1.5 text-xs text-gray-500 leading-relaxed pl-8">
          {description}
        </p>
      </div>

      <div className="flex-shrink-0 pt-1">{right}</div>
    </div>
  );
}