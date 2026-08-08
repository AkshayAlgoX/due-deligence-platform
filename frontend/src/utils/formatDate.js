// src/utils/formatDate.js
// ---------------------------------------------------------------------------
// Relative + absolute date formatting — zero dependencies (plain Intl API)
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable relative time string.
 * Examples: "just now", "2h ago", "yesterday", "3 days ago", "12 Jan 2026"
 *
 * @param {string|Date} dateInput - ISO string or Date object
 * @returns {string}
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return "—";

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 30) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffWeek === 1) return "last week";
  if (diffWeek < 5) return `${diffWeek} weeks ago`;
  if (diffMonth < 12) return `${diffMonth} months ago`;

  // Fallback: absolute short date
  return formatAbsoluteDate(date);
}

/**
 * Returns a formatted absolute date string.
 * Example: "8 Aug 2026, 14:32"
 *
 * @param {string|Date} dateInput
 * @param {boolean} includeTime - default true
 * @returns {string}
 */
export function formatAbsoluteDate(dateInput, includeTime = true) {
  if (!dateInput) return "—";

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "—";

  const dateStr = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (!includeTime) return dateStr;

  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${dateStr}, ${timeStr}`;
}

/**
 * Returns a short date only string.
 * Example: "8 Aug 2026"
 *
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatShortDate(dateInput) {
  return formatAbsoluteDate(dateInput, false);
}