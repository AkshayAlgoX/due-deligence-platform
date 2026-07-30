"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import LanguageModal from "./LanguageModal";

/**
 * LanguageTrigger — compact button that opens the language modal.
 *
 * Variants:
 *   - "icon"    → globe icon only (compact, for tight navbars)
 *   - "compact" → globe + language code (e.g., "EN" / "हि") [default]
 *   - "full"    → globe + native name (e.g., "हिन्दी")
 *
 * Usage:
 *   <LanguageTrigger />                     // default: compact
 *   <LanguageTrigger variant="icon" />      // just globe
 *   <LanguageTrigger variant="full" />      // full native name
 */
export default function LanguageTrigger({ variant = "compact", className = "" }) {
  const [open, setOpen] = useState(false);
  const { currentLang } = useLocale();

  // Short display code — use native short form when script is non-Latin
  const shortCode = getShortCode(currentLang);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Change language. Current: ${currentLang.label}`}
        title={`${currentLang.label} — ${currentLang.nativeLabel}`}
        className={`
          inline-flex items-center gap-2 rounded-xl
          border border-gray-200 dark:border-[#30363d]
          bg-white dark:bg-[#161b22]
          px-3 py-2
          text-sm font-bold text-gray-700 dark:text-[#e6edf3]
          shadow-sm
          transition
          hover:border-gray-300 dark:hover:border-[#484f58]
          hover:bg-gray-50 dark:hover:bg-[#1c2128]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2
          ${className}
        `}
      >
        <Globe className="h-4 w-4 text-[#16a34a]" strokeWidth={2.2} />

        {variant === "compact" && (
          <span
            className="text-xs font-black uppercase tracking-wider"
            style={{ fontFamily: getFontFamily(currentLang.script) }}
          >
            {shortCode}
          </span>
        )}

        {variant === "full" && (
          <span
            className="text-xs font-bold"
            style={{ fontFamily: getFontFamily(currentLang.script) }}
          >
            {currentLang.nativeLabel}
          </span>
        )}
      </button>

      <LanguageModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────
function getShortCode(lang) {
  if (!lang) return "EN";
  // For non-Latin scripts, show first 2 chars of native name (looks premium)
  if (lang.script !== "Latin") {
    return lang.nativeLabel.slice(0, 2);
  }
  return lang.code.toUpperCase();
}

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