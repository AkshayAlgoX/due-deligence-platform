"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Search, Check, X, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useLocale } from "@/hooks/useLocale";
import { getLanguagesByRegion } from "@/i18n";

/**
 * LanguageModal — Airbnb-style full-screen language picker.
 *
 * Features:
 *   - Regional grouping (India / International)
 *   - Live search filter by English name, native name, or code
 *   - Native script rendered large + English name small
 *   - Beta badge for partial-coverage translations
 *   - Keyboard nav: ↑↓ to move, Enter to select, Esc to close
 *   - RTL-aware layout
 *   - Full dark mode
 *   - Framer Motion fade + scale animation
 *   - Portal-rendered (escapes overflow: hidden ancestors)
 */
export default function LanguageModal({ open, onClose }) {
  const { t } = useTranslation();
  const { locale, changeLocale, currentLang } = useLocale();

  const [query, setQuery] = useState("");
  const [switching, setSwitching] = useState(null); // code being loaded
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef(null);

  // Portal-safe mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus search on open, reset query on close
  useEffect(() => {
    if (open) {
      // small delay so animation completes before focus jumps
      const timer = setTimeout(() => searchRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
    setQuery("");
    setSwitching(null);
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Body scroll lock while modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Grouped + filtered languages
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = getLanguagesByRegion();
    if (!q) return groups;

    const filtered = {};
    for (const [region, langs] of Object.entries(groups)) {
      const matches = langs.filter(
        (l) =>
          l.label.toLowerCase().includes(q) ||
          l.nativeLabel.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q)
      );
      if (matches.length > 0) filtered[region] = matches;
    }
    return filtered;
  }, [query]);

  const totalResults = useMemo(
    () => Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0),
    [grouped]
  );

  const handleSelect = async (code) => {
    if (code === locale) {
      onClose?.();
      return;
    }
    setSwitching(code);
    try {
      await changeLocale(code);
      const meta = grouped[Object.keys(grouped)[0]]?.find((l) => l.code === code) ||
        Object.values(grouped).flat().find((l) => l.code === code);
      toast.success(t("settings.language.saved"), {
        description: t("settings.language.savedDescription", {
          language: meta?.nativeLabel ?? code,
        }),
      });
      onClose?.();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSwitching(null);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-8 pointer-events-none"
          >
            <div
              className="pointer-events-auto flex h-full max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#161b22] shadow-2xl ring-1 ring-black/5 dark:ring-[#30363d]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="lang-modal-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#30363d] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818] ring-1 ring-green-100 dark:ring-green-900/50">
                    <Globe className="h-5 w-5 text-[#16a34a]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2
                      id="lang-modal-title"
                      className="text-lg font-black tracking-tight text-gray-900 dark:text-[#e6edf3]"
                    >
                      Choose your language
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-[#7d8590]">
                      Currently: {currentLang.nativeLabel} · {currentLang.label}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 dark:text-[#7d8590] transition hover:bg-gray-100 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-[#e6edf3]"
                >
                  <X className="h-5 w-5" strokeWidth={2.2} />
                </button>
              </div>

              {/* Search */}
              <div className="border-b border-gray-100 dark:border-[#30363d] px-6 py-4">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#6e7681]"
                    strokeWidth={2.2}
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${totalResults} languages…`}
                    className="
                      w-full rounded-xl border border-gray-200 dark:border-[#30363d]
                      bg-gray-50 dark:bg-[#0d1117]
                      pl-10 pr-4 py-2.5
                      text-sm font-medium text-gray-900 dark:text-[#e6edf3]
                      placeholder:text-gray-400 dark:placeholder:text-[#6e7681]
                      focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20
                      transition
                    "
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {totalResults === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1c2128]">
                      <Search className="h-6 w-6 text-gray-400 dark:text-[#6e7681]" strokeWidth={2} />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
                      No languages found
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590]">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(grouped).map(([region, langs]) => (
                      <div key={region}>
                        <h3 className="mb-3 text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                          {region} · {langs.length}
                        </h3>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {langs.map((lang) => {
                            const isActive = lang.code === locale;
                            const isLoading = switching === lang.code;
                            const isDisabled = switching !== null;

                            return (
                              <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                disabled={isDisabled}
                                dir={lang.dir}
                                className={`
                                  group relative flex items-center gap-3 rounded-2xl border p-3.5 text-left transition
                                  ${
                                    isActive
                                      ? "border-[#22C55E] bg-[#edf7f3] dark:bg-[#0d2818] ring-1 ring-[#22C55E]/30"
                                      : "border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] hover:border-gray-300 dark:hover:border-[#484f58] hover:bg-gray-50 dark:hover:bg-[#1c2128]"
                                  }
                                  ${isDisabled && !isLoading ? "opacity-50 cursor-not-allowed" : ""}
                                  ${isLoading ? "cursor-wait" : ""}
                                `}
                              >
                                {/* Flag */}
                                <div
                                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl ${
                                    isActive
                                      ? "bg-white dark:bg-[#161b22] ring-1 ring-[#22C55E]/20"
                                      : "bg-gray-100 dark:bg-[#161b22] ring-1 ring-gray-200 dark:ring-[#30363d]"
                                  }`}
                                  aria-hidden="true"
                                >
                                  {lang.flag}
                                </div>

                                {/* Names */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p
                                      className={`truncate text-base font-black leading-tight ${
                                        isActive
                                          ? "text-[#16a34a] dark:text-[#22C55E]"
                                          : "text-gray-900 dark:text-[#e6edf3]"
                                      }`}
                                      style={{
                                        fontFamily:
                                          lang.script === "Devanagari"
                                            ? "'Noto Sans Devanagari', sans-serif"
                                            : lang.script === "Bengali"
                                            ? "'Noto Sans Bengali', sans-serif"
                                            : lang.script === "Tamil"
                                            ? "'Noto Sans Tamil', sans-serif"
                                            : lang.script === "Telugu"
                                            ? "'Noto Sans Telugu', sans-serif"
                                            : lang.script === "Kannada"
                                            ? "'Noto Sans Kannada', sans-serif"
                                            : lang.script === "Malayalam"
                                            ? "'Noto Sans Malayalam', sans-serif"
                                            : lang.script === "Gujarati"
                                            ? "'Noto Sans Gujarati', sans-serif"
                                            : lang.script === "Gurmukhi"
                                            ? "'Noto Sans Gurmukhi', sans-serif"
                                            : lang.script === "Arabic"
                                            ? "'Noto Naskh Arabic', sans-serif"
                                            : undefined,
                                      }}
                                    >
                                      {lang.nativeLabel}
                                    </p>
                                    {lang.beta && (
                                      <span className="flex-shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                        Beta
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-0.5 truncate text-xs font-semibold text-gray-500 dark:text-[#7d8590]">
                                    {lang.label}
                                  </p>
                                </div>

                                {/* Status icon */}
                                <div className="flex-shrink-0">
                                  {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-[#22C55E]" strokeWidth={2.5} />
                                  ) : isActive ? (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E]">
                                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                    </div>
                                  ) : null}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 dark:border-[#30363d] bg-gray-50 dark:bg-[#0d1117] px-6 py-3">
                <p className="text-[11px] font-medium text-gray-500 dark:text-[#7d8590]">
                  <span className="font-bold">Tip:</span> Beta languages have partial coverage. English fallback used for missing keys.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}