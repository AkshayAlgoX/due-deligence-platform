/**
 * i18n formatters — locale-aware Intl API wrappers.
 *
 * Why this file:
 *   Instead of hardcoding "₹" or "en-IN" formatting in components,
 *   route everything through these helpers. They automatically adapt
 *   to the active language (via localeTag from SUPPORTED_LANGUAGES).
 *
 * Usage in components:
 *   import { formatCurrency, formatDate } from "@/i18n/formatters";
 *   formatCurrency(1500000, "hi");  → "₹15,00,000"
 *   formatCurrency(1500000, "en");  → "₹15,00,000"
 *
 * Preferred: use via useLocale() hook which auto-passes current locale.
 */

import { getLanguageMeta } from "./index";

// Cache Intl instances (they're expensive to construct — reuse them)
const cache = {
  currency: new Map(),
  number: new Map(),
  date: new Map(),
  dateTime: new Map(),
  relativeTime: new Map(),
};

// ── Helpers ──────────────────────────────────────────────────────────────
function getLocaleTag(langCode) {
  return getLanguageMeta(langCode)?.localeTag ?? "en-IN";
}

// ── Currency (INR-first, but adapts if you pass currency prop) ──────────
/**
 * Format an INR amount with locale-aware digit grouping.
 *
 * @param {number} amount - Number in rupees (e.g., 1500000)
 * @param {string} langCode - Language code (e.g., "hi", "en")
 * @param {object} [opts] - Optional overrides
 * @param {string} [opts.currency="INR"] - ISO currency code
 * @param {boolean} [opts.compact=false] - Use compact notation ("15L" instead of "15,00,000")
 * @returns {string} Formatted currency string
 *
 * Examples:
 *   formatCurrency(1500000, "en")           → "₹15,00,000"
 *   formatCurrency(1500000, "hi")           → "₹15,00,000" (localized digits if font supports)
 *   formatCurrency(1500000, "en", { compact: true }) → "₹15L"
 */
export function formatCurrency(amount, langCode = "en", opts = {}) {
  const { currency = "INR", compact = false } = opts;
  if (amount == null || isNaN(amount)) return "—";

  const locale = getLocaleTag(langCode);
  const cacheKey = `${locale}|${currency}|${compact}`;

  if (!cache.currency.has(cacheKey)) {
    try {
      cache.currency.set(
        cacheKey,
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          notation: compact ? "compact" : "standard",
          maximumFractionDigits: 0,
        })
      );
    } catch {
      // Fallback if locale is invalid
      cache.currency.set(
        cacheKey,
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        })
      );
    }
  }

  return cache.currency.get(cacheKey).format(amount);
}

// ── Plain Number (with locale grouping) ──────────────────────────────────
/**
 * Format a number with locale-aware digit grouping.
 *
 * @param {number} n - Number to format
 * @param {string} langCode - Language code
 * @param {object} [opts]
 * @param {number} [opts.decimals=0] - Number of decimal places
 * @returns {string}
 *
 * Examples:
 *   formatNumber(1234567, "en")            → "12,34,567"
 *   formatNumber(1234567.89, "en", { decimals: 2 })  → "12,34,567.89"
 */
export function formatNumber(n, langCode = "en", opts = {}) {
  const { decimals = 0 } = opts;
  if (n == null || isNaN(n)) return "—";

  const locale = getLocaleTag(langCode);
  const cacheKey = `${locale}|${decimals}`;

  if (!cache.number.has(cacheKey)) {
    cache.number.set(
      cacheKey,
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    );
  }

  return cache.number.get(cacheKey).format(n);
}

// ── Date ─────────────────────────────────────────────────────────────────
/**
 * Format a date in the active locale.
 *
 * @param {Date|string|number} date - Date input
 * @param {string} langCode - Language code
 * @param {object} [opts]
 * @param {string} [opts.dateStyle="medium"] - "full" | "long" | "medium" | "short"
 * @returns {string}
 *
 * Examples:
 *   formatDate(new Date(), "en")  → "5 Feb 2025"
 *   formatDate(new Date(), "hi")  → "5 फ़र॰ 2025"
 */
export function formatDate(date, langCode = "en", opts = {}) {
  const { dateStyle = "medium" } = opts;
  if (!date) return "—";

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  const locale = getLocaleTag(langCode);
  const cacheKey = `${locale}|${dateStyle}`;

  if (!cache.date.has(cacheKey)) {
    cache.date.set(cacheKey, new Intl.DateTimeFormat(locale, { dateStyle }));
  }

  return cache.date.get(cacheKey).format(d);
}

// ── Date + Time ──────────────────────────────────────────────────────────
/**
 * Format a date + time in the active locale.
 *
 * @param {Date|string|number} date
 * @param {string} langCode
 * @param {object} [opts]
 * @param {string} [opts.dateStyle="medium"]
 * @param {string} [opts.timeStyle="short"] - "full" | "long" | "medium" | "short"
 * @returns {string}
 */
export function formatDateTime(date, langCode = "en", opts = {}) {
  const { dateStyle = "medium", timeStyle = "short" } = opts;
  if (!date) return "—";

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  const locale = getLocaleTag(langCode);
  const cacheKey = `${locale}|${dateStyle}|${timeStyle}`;

  if (!cache.dateTime.has(cacheKey)) {
    cache.dateTime.set(
      cacheKey,
      new Intl.DateTimeFormat(locale, { dateStyle, timeStyle })
    );
  }

  return cache.dateTime.get(cacheKey).format(d);
}

// ── Relative Time ("2 min ago", "3 days ago") ────────────────────────────
/**
 * Format a date as relative time (e.g., "2 min ago", "yesterday").
 *
 * @param {Date|string|number} date - Time in the past (or future)
 * @param {string} langCode
 * @returns {string}
 *
 * Examples:
 *   formatRelativeTime(new Date(Date.now() - 60000), "en") → "1 minute ago"
 *   formatRelativeTime(new Date(Date.now() - 60000), "hi") → "1 मिनट पहले"
 */
export function formatRelativeTime(date, langCode = "en") {
  if (!date) return "—";

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  const locale = getLocaleTag(langCode);
  if (!cache.relativeTime.has(locale)) {
    cache.relativeTime.set(
      locale,
      new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
    );
  }
  const rtf = cache.relativeTime.get(locale);

  const diffMs = d.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second");
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month");
  return rtf.format(diffYear, "year");
}

// ── Percentage ───────────────────────────────────────────────────────────
/**
 * Format a decimal (0..1) or integer as a percentage.
 *
 * @param {number} n - If 0..1, treated as ratio; else treated as percentage value directly
 * @param {string} langCode
 * @param {object} [opts]
 * @param {number} [opts.decimals=0]
 * @returns {string}
 *
 * Examples:
 *   formatPercent(0.75, "en")             → "75%"
 *   formatPercent(0.7523, "en", { decimals: 1 })  → "75.3%"
 */
export function formatPercent(n, langCode = "en", opts = {}) {
  const { decimals = 0 } = opts;
  if (n == null || isNaN(n)) return "—";

  const locale = getLocaleTag(langCode);
  // Auto-scale: if between 0..1, treat as ratio; else divide by 100
  const value = Math.abs(n) <= 1 ? n : n / 100;

  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ── File Size ────────────────────────────────────────────────────────────
/**
 * Format bytes as a human-readable file size.
 * (Intl doesn't have a built-in for this — we handle manually.)
 *
 * @param {number} bytes
 * @param {string} langCode
 * @returns {string}
 *
 * Examples:
 *   formatFileSize(1024, "en")       → "1 KB"
 *   formatFileSize(1500000, "en")    → "1.43 MB"
 */
export function formatFileSize(bytes, langCode = "en") {
  if (bytes == null || isNaN(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  const decimals = i === 0 ? 0 : 2;

  return `${formatNumber(value, langCode, { decimals })} ${units[i]}`;
}

// ── Compact big numbers (35,000 → "35K", 15,00,000 → "15L") ──────────────
/**
 * Format big numbers with Indian-style abbreviations (K, L, Cr) for INR context.
 * Falls back to Intl compact notation for non-Indian locales.
 *
 * @param {number} n
 * @param {string} langCode
 * @returns {string}
 *
 * Examples:
 *   formatCompactINR(150000, "en")     → "1.5L"
 *   formatCompactINR(15000000, "en")   → "1.5Cr"
 *   formatCompactINR(1500, "en")       → "1.5K"
 */
export function formatCompactINR(n, langCode = "en") {
  if (n == null || isNaN(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (abs >= 10000000) return `${sign}${formatNumber(abs / 10000000, langCode, { decimals: abs % 10000000 === 0 ? 0 : 2 })} Cr`;
  if (abs >= 100000) return `${sign}${formatNumber(abs / 100000, langCode, { decimals: abs % 100000 === 0 ? 0 : 2 })} L`;
  if (abs >= 1000) return `${sign}${formatNumber(abs / 1000, langCode, { decimals: abs % 1000 === 0 ? 0 : 1 })} K`;
  return `${sign}${formatNumber(abs, langCode)}`;
}