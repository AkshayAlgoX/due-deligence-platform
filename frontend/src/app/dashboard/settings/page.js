"use client";

import { useEffect } from "react";
import { Settings } from "lucide-react";
import LanguageSelector from "@/components/settings/LanguageSelector";

/**
 * Settings page.
 *
 * Designed to be extended — each setting is a self-contained section.
 * Team lead can add new sections below the existing ones without touching
 * the Language section.
 */
export default function SettingsPage() {
  useEffect(() => {
    document.title = "Settings | Real Estate Due Diligence";
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 ring-1 ring-green-200">
            <Settings className="h-5 w-5 text-[#16a34a]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900">
              Settings
            </h1>
            <p className="text-sm text-gray-500">
              Manage your preferences and application configuration.
            </p>
          </div>
        </div>
      </div>

      {/* ── Language ────────────────────────────────────────────────────── */}
      <LanguageSelector />

      {/*
        ── ADD NEW SETTINGS SECTIONS BELOW ────────────────────────────────
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
