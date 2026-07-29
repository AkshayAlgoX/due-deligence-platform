"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { toast } from "sonner";

import { SUPPORTED_LANGUAGES, changeLanguage } from "@/i18n";

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [changing, setChanging] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(
    (l) => l.code === i18n.language
  ) ?? SUPPORTED_LANGUAGES[0];

  const handleChange = async (e) => {
    const code = e.target.value;
    if (code === i18n.language) return;

    setChanging(true);
    try {
      await changeLanguage(code);
      const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
      toast.success(t("settings.language.saved"), {
        description: t("settings.language.savedDescription", {
          language: lang?.nativeLabel ?? lang?.label,
        }),
      });
    } catch {
      toast.error(t("common.error"));
    } finally {
      setChanging(false);
    }
  };

  return (
    <section aria-labelledby="lang-section-title">
      {/* Section header */}
      <div className="mb-4">
        <h2
          id="lang-section-title"
          className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]"
        >
          {t("settings.language.sectionTitle")}
        </h2>
        <p className="mt-1 text-xs text-gray-400 dark:text-[#6e7681]">
          {t("settings.language.sectionSubtitle")}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          {/* Left: icon + label */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818] ring-1 ring-green-100 dark:ring-green-900/50">
              <Globe className="h-4 w-4 text-[#16a34a]" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3]">
                {t("settings.language.label")}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-[#7d8590]">
                {currentLang.nativeLabel}
              </p>
            </div>
          </div>

          {/* Right: dropdown */}
          <div className="relative">
            <label htmlFor="language-select" className="sr-only">
              {t("settings.language.label")}
            </label>
            <select
              id="language-select"
              value={i18n.language}
              onChange={handleChange}
              disabled={changing}
              aria-label={t("settings.language.label")}
              className="
                h-10 min-w-[200px] appearance-none
                rounded-xl border border-gray-200 dark:border-[#30363d]
                bg-white dark:bg-[#0d1117]
                pl-3 pr-8
                text-sm font-semibold text-gray-800 dark:text-[#e6edf3]
                transition
                hover:border-gray-300 dark:hover:border-[#484f58]
                focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20
                disabled:cursor-not-allowed disabled:opacity-60
                cursor-pointer
              "
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label} — {lang.nativeLabel}
                </option>
              ))}
            </select>

            {/* Custom chevron / spinner */}
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              {changing ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 dark:border-[#30363d] border-t-[#22C55E]" />
              ) : (
                <svg
                  className="h-3.5 w-3.5 text-gray-400 dark:text-[#6e7681]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Current selection pill */}
        <div className="mt-4 flex items-center gap-2">
          <Check className="h-3.5 w-3.5 text-[#22C55E]" strokeWidth={2.5} />
          <span className="text-xs font-semibold text-gray-500 dark:text-[#7d8590]">
            {currentLang.label} ({currentLang.nativeLabel})
          </span>
        </div>
      </div>
    </section>
  );
}