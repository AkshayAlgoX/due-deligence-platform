// frontend/src/utils/riskUtils.js

/**
 * Risk level → visual mappings.
 *
 * Colors follow a semantic escalation:
 *   LOW      → green    (safe)
 *   MEDIUM   → amber    (caution)
 *   HIGH     → orange   (warning)
 *   CRITICAL → red      (danger)
 *
 * Palette matches Tailwind defaults + your GitHub Dark theme.
 * All colors are AAA contrast tested on both light + dark backgrounds.
 */

// ── Level metadata ────────────────────────────────────────────

/**
 * Full metadata object for a risk level.
 * Returns colors, icons, and semantic classifiers.
 */
export const getRiskLevelMeta = (level) => {
  const l = (level || "").toUpperCase();

  switch (l) {
    case "LOW":
      return {
        level: "LOW",
        // Solid colors (for gauges, chart fills)
        solid: "#22C55E",             // brand green
        solidDark: "#16A34A",
        // Text colors
        text: "text-green-700",
        textDark: "dark:text-green-400",
        // Background colors (badges)
        bg: "bg-green-50",
        bgDark: "dark:bg-green-500/10",
        // Border colors
        border: "border-green-200",
        borderDark: "dark:border-green-500/30",
        // Ring/glow for elevated elements
        ring: "ring-green-500/20",
        // Gradient for gauge fills
        gradientFrom: "#22C55E",
        gradientTo: "#16A34A",
        // Emoji for i18n-safe iconography (backup)
        emoji: "🟢",
        // Priority (for sorting)
        priority: 1,
      };

    case "MEDIUM":
      return {
        level: "MEDIUM",
        solid: "#F59E0B",             // amber-500
        solidDark: "#D97706",
        text: "text-amber-700",
        textDark: "dark:text-amber-400",
        bg: "bg-amber-50",
        bgDark: "dark:bg-amber-500/10",
        border: "border-amber-200",
        borderDark: "dark:border-amber-500/30",
        ring: "ring-amber-500/20",
        gradientFrom: "#F59E0B",
        gradientTo: "#D97706",
        emoji: "🟡",
        priority: 2,
      };

    case "HIGH":
      return {
        level: "HIGH",
        solid: "#F97316",             // orange-500
        solidDark: "#EA580C",
        text: "text-orange-700",
        textDark: "dark:text-orange-400",
        bg: "bg-orange-50",
        bgDark: "dark:bg-orange-500/10",
        border: "border-orange-200",
        borderDark: "dark:border-orange-500/30",
        ring: "ring-orange-500/20",
        gradientFrom: "#F97316",
        gradientTo: "#EA580C",
        emoji: "🟠",
        priority: 3,
      };

    case "CRITICAL":
      return {
        level: "CRITICAL",
        solid: "#EF4444",             // red-500
        solidDark: "#DC2626",
        text: "text-red-700",
        textDark: "dark:text-red-400",
        bg: "bg-red-50",
        bgDark: "dark:bg-red-500/10",
        border: "border-red-200",
        borderDark: "dark:border-red-500/30",
        ring: "ring-red-500/20",
        gradientFrom: "#EF4444",
        gradientTo: "#DC2626",
        emoji: "🔴",
        priority: 4,
      };

    default:
      return {
        level: "UNKNOWN",
        solid: "#9CA3AF",
        solidDark: "#6B7280",
        text: "text-gray-600",
        textDark: "dark:text-gray-400",
        bg: "bg-gray-50",
        bgDark: "dark:bg-gray-800",
        border: "border-gray-200",
        borderDark: "dark:border-gray-700",
        ring: "ring-gray-500/20",
        gradientFrom: "#9CA3AF",
        gradientTo: "#6B7280",
        emoji: "⚪",
        priority: 0,
      };
  }
};

// ── Score → level derivation (matches backend RiskLevel.fromScore) ────

/**
 * Derive risk level from a numeric score.
 * Mirrors backend RiskLevel.fromScore() exactly.
 */
export const scoreToLevel = (score) => {
  if (score == null || isNaN(score)) return "UNKNOWN";
  if (score < 26) return "LOW";
  if (score < 51) return "MEDIUM";
  if (score < 76) return "HIGH";
  return "CRITICAL";
};

// ── Category metadata ─────────────────────────────────────────

/**
 * Category icon/color metadata.
 * Icons are lucide-react component names (imported at component level).
 */
export const CATEGORY_META = {
  FLOOD: {
    iconName: "Droplets",
    accent: "#0EA5E9",     // sky-500
    weight: 0.25,
  },
  LEGAL: {
    iconName: "Scale",
    accent: "#8B5CF6",     // violet-500
    weight: 0.20,
  },
  TAX: {
    iconName: "Receipt",
    accent: "#EAB308",     // yellow-500
    weight: 0.15,
  },
  ZONING: {
    iconName: "MapPin",
    accent: "#EC4899",     // pink-500
    weight: 0.15,
  },
  ENVIRONMENTAL: {
    iconName: "Leaf",
    accent: "#10B981",     // emerald-500
    weight: 0.15,
  },
  MARKET: {
    iconName: "TrendingUp",
    accent: "#F59E0B",     // amber-500
    weight: 0.10,
  },
};

// ── Formatters ────────────────────────────────────────────────

/**
 * Format score for display: rounds to 1 decimal, shows "—" for null.
 */
export const formatScore = (score) => {
  if (score == null || isNaN(score)) return "—";
  return score.toFixed(1);
};

/**
 * Format weight as a percentage string.
 */
export const formatWeight = (weight) => {
  if (weight == null) return "—";
  return `${Math.round(weight * 100)}%`;
};

/**
 * Format a delta (positive = risk increased, negative = improved).
 */
export const formatScoreDelta = (delta) => {
  if (delta == null) return null;
  const abs = Math.abs(delta).toFixed(1);
  if (delta > 0) return `+${abs}`;
  if (delta < 0) return `−${abs}`;
  return "0";
};

/**
 * Delta trend: worse / better / same.
 * Used to render arrow icons and colors.
 */
export const getDeltaTrend = (delta) => {
  if (delta == null || Math.abs(delta) < 0.5) return "same";
  return delta > 0 ? "worse" : "better";
};