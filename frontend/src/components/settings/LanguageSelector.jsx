"use client";

import { useTranslation } from "react-i18next";
import { Globe, Check, ChevronRight, Info } from "lucide-react";

import { useLocale } from "@/hooks/useLocale";
import LanguageTrigger from "@/components/language/LanguageTrigger";

/**
 * LanguageSelector — settings page section for language preferences.
 *
 * Displays:
 *   - Current language (native + English name)
 *   - Beta badge if applicable
 *   - Native script preview
 *   - Trigger button that opens the Airbnb-style modal
 *   - Helpful footer about beta languages
 */
export default function LanguageSelector() {
  const { t } = useTranslation();
  const { currentLang } = useLocale();

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

      {/* Main card */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          {/* Left: icon + current selection */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818] ring-1 ring-green-100 dark:ring-green-900/50">
              <Globe className="h-4 w-4 text-[#16a34a]" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3]">
                  {t("settings.language.label")}
                </p>
                {currentLang.beta && (
                  <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Beta
                  </span>
                )}
              </div>
              <p
                className="mt-1 text-base font-black text-gray-900 dark:text-[#e6edf3]"
                style={{ fontFamily: getFontFamily(currentLang.script) }}
              >
                {currentLang.nativeLabel}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-gray-500 dark:text-[#7d8590]">
                {currentLang.label} · {currentLang.region}
              </p>
            </div>
          </div>

          {/* Right: change button */}
          <button
            type="button"
            onClick={(e) => {
              // trigger the same modal by clicking the LanguageTrigger below
              const trigger = e.currentTarget.parentElement.parentElement.querySelector(
                "[data-language-trigger] button"
              );
              trigger?.click();
            }}
            className="
              inline-flex items-center gap-1.5 rounded-xl
              border border-gray-200 dark:border-[#30363d]
              bg-white dark:bg-[#0d1117]
              px-4 py-2.5
              text-sm font-bold text-gray-700 dark:text-[#e6edf3]
              transition
              hover:border-[#22C55E]
              hover:bg-[#edf7f3] dark:hover:bg-[#0d2818]
              hover:text-[#16a34a] dark:hover:text-[#22C55E]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2
            "
          >
            Change language
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Confirmation pill */}
        <div className="mt-4 flex items-center gap-2 border-t border-gray-100 dark:border-[#30363d] pt-4">
          <Check className="h-3.5 w-3.5 text-[#22C55E]" strokeWidth={2.5} />
          <span className="text-xs font-semibold text-gray-500 dark:text-[#7d8590]">
            Interface is active in{" "}
            <span
              className="font-black text-gray-800 dark:text-[#e6edf3]"
              style={{ fontFamily: getFontFamily(currentLang.script) }}
            >
              {currentLang.nativeLabel}
            </span>
          </span>
        </div>

        {/* Hidden trigger — reused by the "Change language" button above */}
        <div data-language-trigger className="hidden">
          <LanguageTrigger />
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-3 flex items-start gap-2 rounded-xl bg-gray-50 dark:bg-[#0d1117] px-4 py-3 ring-1 ring-gray-100 dark:ring-[#30363d]">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-[#6e7681]" strokeWidth={2.2} />
        <p className="text-[11px] leading-relaxed text-gray-500 dark:text-[#7d8590]">
          Your language preference is saved to this browser. Beta languages have
          partial coverage — English is used as fallback for missing translations.
        </p>
      </div>
    </section>
  );
}

// Local helper — same map as LanguageTrigger
function getFontFamily(script) {
  const map = {
    Devanagari: "'Noto Sans Devanagari', sans-serif",
    Bengali: "'Noto Sans Bengali', sans-serif",
    Tamil: "'Noto Sans Tamil', sans-serif",
    Telugu: "'Noto Sans Telugu', sans-serif",
    Kannada: "'Noto Sans Kannada', sans-serif",
    Malayalam: "'Noto Sans Malayalam', sans-serif",
    Gujarati: "'Noto Sans Gujarati', sans-serif",
    Gurmukhi: "'Noto Sans Gurmukhi', sans-serif",
    Arabic: "'Noto Naskh Arabic', sans-serif",
  };
  return map[script];
}