"use client";

import { useEffect } from "react";
import { Settings } from "lucide-react";
import LanguageSelector from "@/components/settings/LanguageSelector";

export default function SettingsPage() {
  useEffect(() => {
    document.title = "Settings | Real Estate Due Diligence";
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">

      {/* ── Page header ── */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-[#0d2818] ring-1 ring-green-200 dark:ring-green-900/50">
            <Settings className="h-5 w-5 text-[#16a34a]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-[#e6edf3]">
              Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-[#7d8590]">
              Manage your preferences and application configuration.
            </p>
          </div>
        </div>
      </div>

      {/* ── Language ── */}
      <LanguageSelector />

      {/*
        ── ADD NEW SETTINGS SECTIONS BELOW ──────────────────────────────
        Each section follows the same pattern as LanguageSelector:
        a self-contained component with its own section header and card.

        Example:
        <NotificationSettings />
        <ThemeSettings />
        <PrivacySettings />
      */}
    </div>
  );
}