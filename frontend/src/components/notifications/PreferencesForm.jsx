"use client";

/**
 * PreferencesForm — notification preference toggles.
 *
 * Organized by notification type, with Email / In-App sub-toggles.
 * Self-contained: fetches, displays, and saves preferences.
 */
import { useTranslation } from "react-i18next";
import { Bell, FileText, AlertTriangle, TrendingUp, Save } from "lucide-react";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Skeleton } from "@/components/ui/Skeleton";

const PREFERENCE_GROUPS = [
  {
    type:       "reportReady",
    icon:       FileText,
    titleKey:   "notification.preferences.reportReady",
    emailKey:   "reportReadyEmail",
    inAppKey:   "reportReadyInApp",
  },
  {
    type:       "riskAlert",
    icon:       AlertTriangle,
    titleKey:   "notification.preferences.riskAlert",
    emailKey:   "riskAlertEmail",
    inAppKey:   "riskAlertInApp",
  },
  {
    type:       "priceChange",
    icon:       TrendingUp,
    titleKey:   "notification.preferences.priceChange",
    emailKey:   "priceChangeEmail",
    inAppKey:   "priceChangeInApp",
  },
  {
    type:       "system",
    icon:       Bell,
    titleKey:   "notification.preferences.system",
    emailKey:   "systemEmail",
    inAppKey:   "systemInApp",
  },
];

export default function PreferencesForm() {
  const { t } = useTranslation();
  const { preferences, loading, saving, togglePreference, savePreferences } =
    useNotificationPreferences();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_80px_80px] gap-3 px-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
          {t("notification.preferences.type")}
        </span>
        <span className="text-center text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
          {t("notification.preferences.email")}
        </span>
        <span className="text-center text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
          {t("notification.preferences.inApp")}
        </span>
      </div>

      {PREFERENCE_GROUPS.map(({ type, icon: Icon, titleKey, emailKey, inAppKey }) => (
        <div
          key={type}
          className="grid grid-cols-[1fr_80px_80px] items-center gap-3 rounded-xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3 py-3"
        >
          {/* Label */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 dark:bg-[#0d2818]">
              <Icon size={15} className="text-[#16a34a]" />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">
              {t(titleKey)}
            </span>
          </div>

          {/* Email toggle */}
          <div className="flex justify-center">
            <Toggle
              checked={preferences[emailKey]}
              onChange={() => togglePreference(emailKey)}
              label={`${t(titleKey)} email`}
            />
          </div>

          {/* In-App toggle */}
          <div className="flex justify-center">
            <Toggle
              checked={preferences[inAppKey]}
              onChange={() => togglePreference(inAppKey)}
              label={`${t(titleKey)} in-app`}
            />
          </div>
        </div>
      ))}

      {/* Save button */}
      <button
        type="button"
        disabled={saving}
        onClick={() => savePreferences(preferences)}
        className="
          flex items-center gap-2
          rounded-xl bg-[#22C55E] px-5 py-2.5
          text-sm font-bold text-white
          shadow-[0_8px_20px_rgba(34,197,94,0.3)]
          transition hover:bg-[#16a34a] hover:scale-[1.02]
          active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        <Save size={15} />
        {saving ? t("notification.preferences.saving") : t("notification.preferences.save")}
      </button>
    </div>
  );
}

/** Accessible toggle switch component */
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`
        relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2
        dark:focus:ring-offset-[#161b22]
        ${checked ? "bg-[#22C55E]" : "bg-gray-200 dark:bg-[#30363d]"}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow
          transition-transform duration-200
          ${checked ? "translate-x-4" : "translate-x-0"}
        `}
      />
    </button>
  );
}
