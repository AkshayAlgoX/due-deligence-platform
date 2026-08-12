"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Settings,
  Bell,
  Lock,
  Save,
} from "lucide-react";
import LanguageSelector from "@/components/settings/LanguageSelector";
import PreferencesForm from "@/components/notifications/PreferencesForm";
import { getUser } from "@/utils/helpers";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";

export default function SettingsPage() {
  const { t } = useTranslation();

  // Read role synchronously — same pattern as Sidebar.jsx + dashboard/page.js
  const [userRole] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const user = getUser();
      return user?.role ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    document.title = t("settings.title") + " | Real Estate Due Diligence";
  }, [t]);

    // Guard: skeleton until role is known (no blank flash)
  if (!userRole) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-8">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-[#1c2128] animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-40 rounded-lg bg-gray-100 dark:bg-[#1c2128] animate-pulse" />
            <div className="h-3.5 w-64 rounded bg-gray-100 dark:bg-[#1c2128] animate-pulse" />
          </div>
        </div>
        {/* Section skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-32 rounded bg-gray-100 dark:bg-[#1c2128] animate-pulse" />
            <div className="h-24 w-full rounded-2xl bg-gray-100 dark:bg-[#161b22] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return userRole === "ADMIN" ? <AdminSettings /> : <BuyerSettings />;
}

// ═══════════════════════════════════════════════════════════════
// BUYER SETTINGS — unchanged from original
// ═══════════════════════════════════════════════════════════════
function BuyerSettings() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeader subtitleKey="settings.buyer.subtitle" />
      <LanguageSelector />
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
            {t("notification.preferences.title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-[#7d8590]">
            {t("notification.preferences.description")}
          </p>
        </div>
        <PreferencesForm />
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADMIN SETTINGS — platform-management view
// ═══════════════════════════════════════════════════════════════
function AdminSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { preferences, loading, saving, togglePreference, savePreferences } =
    useNotificationPreferences();

  const handleSave = () => savePreferences(preferences);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeader subtitleKey="settings.admin.subtitle" />

      {/* Section 1: Interface Preferences */}
      <LanguageSelector />

      {/* Section 2: Notifications */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
            {t("settings.admin.sections.notifications")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-[#7d8590]">
            {t("settings.admin.sections.notificationsDesc")}
          </p>
        </div>

        {loading ? (
          <div className="h-16 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-[#1c2128]" />
        ) : preferences ? (
          <div className="space-y-3">
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

            {/* Single row: System Notifications */}
            <div className="grid grid-cols-[1fr_80px_80px] items-center gap-3 rounded-xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 dark:bg-[#0d2818]">
                  <Bell size={15} className="text-[#16a34a]" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">
                    {t("settings.admin.notifications.systemAlerts")}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-[#6e7681]">
                    {t("settings.admin.notifications.systemAlertsDesc")}
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <Toggle
                  checked={preferences.systemEmail}
                  onChange={() => togglePreference("systemEmail")}
                  label="System notifications email"
                />
              </div>
              <div className="flex justify-center">
                <Toggle
                  checked={preferences.systemInApp}
                  onChange={() => togglePreference("systemInApp")}
                  label="System notifications in-app"
                />
              </div>
            </div>

            {/* Save button */}
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition hover:bg-[#16a34a] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={15} />
              {saving ? t("notification.preferences.saving") : t("notification.preferences.save")}
            </button>
          </div>
        ) : null}
      </section>

      {/* Section 3: Account */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
            {t("settings.admin.sections.account")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-[#7d8590]">
            {t("settings.admin.sections.accountDesc")}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818] ring-1 ring-green-100 dark:ring-green-900">
                <Lock className="h-4 w-4 text-[#16a34a] dark:text-green-400" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3]">
                  {t("settings.admin.account.changePassword")}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590]">
                  {t("settings.admin.account.changePasswordDesc")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/profile")}
              className="flex-shrink-0 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-4 py-2 text-xs font-bold text-gray-700 dark:text-[#e6edf3] transition hover:border-[#22C55E] hover:text-[#16a34a] dark:hover:text-[#22C55E] cursor-pointer"
            >
              {t("settings.admin.account.changePasswordButton")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

function PageHeader({ subtitleKey }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-[#0d2818] ring-1 ring-green-200 dark:ring-green-900/50">
          <Settings className="h-5 w-5 text-[#16a34a]" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-[#e6edf3]">
            {t("settings.title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#7d8590]">
            {t(subtitleKey)}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Accessible toggle switch — copied from PreferencesForm.jsx */
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2 dark:focus:ring-offset-[#161b22] ${checked ? "bg-[#22C55E]" : "bg-gray-200 dark:bg-[#30363d]"}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}
