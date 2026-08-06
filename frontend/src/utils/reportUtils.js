// frontend/src/utils/reportUtils.js

/**
 * reportUtils — formatters, mappers, and constants for the report UI.
 *
 * Section types match ReportSectionType enum exactly:
 *   COVER | EXECUTIVE_SUMMARY | PROPERTY_OVERVIEW | RISK_ANALYSIS |
 *   COMPARABLE | FINANCIAL | RECOMMENDATIONS | APPENDIX
 *
 * Report statuses match DueDiligenceReport.ReportStatus enum:
 *   PENDING | GENERATING | COMPLETED | FAILED
 */

// ─────────────────────────────────────────────────────────────
// SECTION METADATA
// ─────────────────────────────────────────────────────────────

/**
 * Ordered list of all 8 section types.
 * Used for TOC rendering and section ordering.
 */
export const SECTION_ORDER = [
  "COVER",
  "EXECUTIVE_SUMMARY",
  "PROPERTY_OVERVIEW",
  "RISK_ANALYSIS",
  "COMPARABLE",
  "FINANCIAL",
  "RECOMMENDATIONS",
  "APPENDIX",
];

/**
 * Section display metadata.
 * label: short TOC label (i18n key suffix)
 * icon:  lucide icon name string (used by section components)
 * anchor: DOM id for sticky TOC scroll
 */
export const SECTION_META = {
  COVER: {
    labelKey: "report.sections.cover",
    defaultLabel: "Cover",
    anchor: "section-cover",
    icon: "FileText",
  },
  EXECUTIVE_SUMMARY: {
    labelKey: "report.sections.executiveSummary",
    defaultLabel: "Executive Summary",
    anchor: "section-executive-summary",
    icon: "Layers",
  },
  PROPERTY_OVERVIEW: {
    labelKey: "report.sections.propertyOverview",
    defaultLabel: "Property Overview",
    anchor: "section-property-overview",
    icon: "Home",
  },
  RISK_ANALYSIS: {
    labelKey: "report.sections.riskAnalysis",
    defaultLabel: "Risk Analysis",
    anchor: "section-risk-analysis",
    icon: "Activity",
  },
  COMPARABLE: {
    labelKey: "report.sections.comparable",
    defaultLabel: "Comparable Properties",
    anchor: "section-comparable",
    icon: "BarChart2",
  },
  FINANCIAL: {
    labelKey: "report.sections.financial",
    defaultLabel: "Financial Analysis",
    anchor: "section-financial",
    icon: "TrendingUp",
  },
  RECOMMENDATIONS: {
    labelKey: "report.sections.recommendations",
    defaultLabel: "Recommendations",
    anchor: "section-recommendations",
    icon: "CheckSquare",
  },
  APPENDIX: {
    labelKey: "report.sections.appendix",
    defaultLabel: "Appendix",
    anchor: "section-appendix",
    icon: "BookOpen",
  },
};

// ─────────────────────────────────────────────────────────────
// STATUS METADATA
// ─────────────────────────────────────────────────────────────

/**
 * Returns display metadata for a report status string.
 * @param {string} status - PENDING | GENERATING | COMPLETED | FAILED
 */
export function getStatusMeta(status) {
  switch (status) {
    case "PENDING":
      return {
        color: "#F59E0B",
        bg: "bg-amber-50 dark:bg-amber-500/10",
        border: "border-amber-200 dark:border-amber-500/25",
        text: "text-amber-700 dark:text-amber-300",
        dot: "bg-amber-400",
        labelKey: "report.status.pending",
        defaultLabel: "Pending",
        isTerminal: false,
      };
    case "GENERATING":
      return {
        color: "#3B82F6",
        bg: "bg-blue-50 dark:bg-blue-500/10",
        border: "border-blue-200 dark:border-blue-500/25",
        text: "text-blue-700 dark:text-blue-300",
        dot: "bg-blue-400",
        labelKey: "report.status.generating",
        defaultLabel: "Generating",
        isTerminal: false,
      };
    case "COMPLETED":
      return {
        color: "#22C55E",
        bg: "bg-green-50 dark:bg-green-500/10",
        border: "border-green-200 dark:border-green-500/25",
        text: "text-green-700 dark:text-green-300",
        dot: "bg-green-400",
        labelKey: "report.status.completed",
        defaultLabel: "Completed",
        isTerminal: true,
      };
    case "FAILED":
      return {
        color: "#EF4444",
        bg: "bg-red-50 dark:bg-red-500/10",
        border: "border-red-200 dark:border-red-500/25",
        text: "text-red-700 dark:text-red-300",
        dot: "bg-red-400",
        labelKey: "report.status.failed",
        defaultLabel: "Failed",
        isTerminal: true,
      };
    default:
      return {
        color: "#7d8590",
        bg: "bg-gray-50 dark:bg-[#161b22]",
        border: "border-gray-200 dark:border-[#30363d]",
        text: "text-gray-600 dark:text-[#7d8590]",
        dot: "bg-gray-400",
        labelKey: "report.status.unknown",
        defaultLabel: status || "Unknown",
        isTerminal: true,
      };
  }
}

/**
 * Terminal statuses — polling should stop when one of these is reached.
 */
export const TERMINAL_STATUSES = new Set(["COMPLETED", "FAILED"]);

/**
 * Returns true if status is terminal (polling should stop).
 * @param {string} status
 */
export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(status);
}

// ─────────────────────────────────────────────────────────────
// DATE + VERSION FORMATTERS
// ─────────────────────────────────────────────────────────────

/**
 * Formats a report creation date for display.
 * Example: "Jan 15, 2025 at 3:42 PM"
 * @param {string} isoString
 */
export function formatReportDate(isoString) {
  if (!isoString) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

/**
 * Formats a short date (no time) for compact display.
 * Example: "Jan 15, 2025"
 * @param {string} isoString
 */
export function formatReportDateShort(isoString) {
  if (!isoString) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

/**
 * Returns a human-readable version label.
 * Example: version 3 → "v3"
 * @param {number} version
 */
export function formatVersion(version) {
  if (!version && version !== 0) return "";
  return `v${version}`;
}

// ─────────────────────────────────────────────────────────────
// SECTION HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Finds a section by type from a sections array.
 * @param {Object[]} sections - array of ReportSectionDto
 * @param {string} type - section type string
 * @returns {Object|null}
 */
export function getSectionByType(sections, type) {
  if (!Array.isArray(sections)) return null;
  return sections.find((s) => s.sectionType === type) || null;
}

/**
 * Safely parses the dataJson field of a section.
 * Returns null if missing or invalid JSON.
 * @param {Object} section - ReportSectionDto
 * @returns {Object|null}
 */
export function parseSectionData(section) {
  if (!section?.dataJson) return null;
  try {
    if (typeof section.dataJson === "object") return section.dataJson;
    return JSON.parse(section.dataJson);
  } catch {
    return null;
  }
}

/**
 * Sorts sections array by SECTION_ORDER.
 * Sections not in SECTION_ORDER go to the end.
 * @param {Object[]} sections
 * @returns {Object[]}
 */
export function sortSections(sections) {
  if (!Array.isArray(sections)) return [];
  return [...sections].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a.sectionType);
    const bi = SECTION_ORDER.indexOf(b.sectionType);
    const aIdx = ai === -1 ? 999 : ai;
    const bIdx = bi === -1 ? 999 : bi;
    return aIdx - bIdx;
  });
}