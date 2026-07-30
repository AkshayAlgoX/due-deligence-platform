"use client";

/**
 * useLocale — unified hook for i18n + formatting.
 *
 * Combines:
 *   - Current language code + metadata
 *   - RTL/LTR direction
 *   - changeLocale() with async lazy-loading
 *   - Pre-bound formatters (currency, date, number, etc.)
 *
 * Why this exists:
 *   Instead of components importing 5 different things
 *   (useTranslation, changeLanguage, SUPPORTED_LANGUAGES, formatCurrency, formatDate),
 *   they call useLocale() once and get everything.
 *
 * Usage:
 *   const {
 *     locale,          // "hi"
 *     dir,             // "ltr" | "rtl"
 *     isRTL,           // boolean
 *     currentLang,     // { code, label, nativeLabel, ... } — full metadata
 *     languages,       // full SUPPORTED_LANGUAGES array
 *     changeLocale,    // async fn (code) => void
 *     changing,        // boolean — true while language is switching
 *     formatCurrency,  // pre-bound to current locale
 *     formatNumber,
 *     formatDate,
 *     formatDateTime,
 *     formatRelativeTime,
 *     formatPercent,
 *     formatFileSize,
 *     formatCompactINR,
 *   } = useLocale();
 */

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SUPPORTED_LANGUAGES,
  changeLanguage,
  getLanguageMeta,
} from "@/i18n";
import {
  formatCurrency as fmtCurrency,
  formatNumber as fmtNumber,
  formatDate as fmtDate,
  formatDateTime as fmtDateTime,
  formatRelativeTime as fmtRelativeTime,
  formatPercent as fmtPercent,
  formatFileSize as fmtFileSize,
  formatCompactINR as fmtCompactINR,
} from "@/i18n/formatters";

export function useLocale() {
  const { i18n } = useTranslation();
  const [changing, setChanging] = useState(false);

  const locale = i18n.language || "en";
  const currentLang = useMemo(() => getLanguageMeta(locale), [locale]);
  const dir = currentLang.dir;
  const isRTL = dir === "rtl";

  // Async wrapper around raw changeLanguage() with loading state
  const changeLocale = useCallback(
    async (code) => {
      if (code === locale) return;
      setChanging(true);
      try {
        await changeLanguage(code);
      } finally {
        setChanging(false);
      }
    },
    [locale]
  );

  // Pre-bound formatters — components just call formatCurrency(value)
  // without passing locale every time.
  const formatters = useMemo(
    () => ({
      formatCurrency: (amount, opts) => fmtCurrency(amount, locale, opts),
      formatNumber: (n, opts) => fmtNumber(n, locale, opts),
      formatDate: (date, opts) => fmtDate(date, locale, opts),
      formatDateTime: (date, opts) => fmtDateTime(date, locale, opts),
      formatRelativeTime: (date) => fmtRelativeTime(date, locale),
      formatPercent: (n, opts) => fmtPercent(n, locale, opts),
      formatFileSize: (bytes) => fmtFileSize(bytes, locale),
      formatCompactINR: (n) => fmtCompactINR(n, locale),
    }),
    [locale]
  );

  return {
    locale,
    dir,
    isRTL,
    currentLang,
    languages: SUPPORTED_LANGUAGES,
    changeLocale,
    changing,
    ...formatters,
  };
}