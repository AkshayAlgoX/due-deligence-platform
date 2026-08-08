// src/utils/riskColor.js
// ---------------------------------------------------------------------------
// Risk score / level → Tailwind color token helpers
// Matches PDF palette exactly: LOW=#16A34A MED=#D97706 HIGH=#DC2626 CRIT=#991B1B
// ---------------------------------------------------------------------------

/**
 * Risk level constants — mirror backend enum values
 */
export const RISK_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

/**
 * Derive risk level from a numeric score (0–100).
 * Matches backend RiskAggregationService thresholds.
 *
 * @param {number|null} score
 * @returns {"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"|null}
 */
export function scoreToLevel(score) {
  if (score === null || score === undefined) return null;
  if (score < 25) return RISK_LEVELS.LOW;
  if (score < 50) return RISK_LEVELS.MEDIUM;
  if (score < 75) return RISK_LEVELS.HIGH;
  return RISK_LEVELS.CRITICAL;
}

/**
 * Returns Tailwind class bundles for a given risk level.
 * Each bundle contains: text, bg, border, dot, ring classes.
 *
 * @param {"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"|null} level
 * @returns {{ text: string, bg: string, border: string, dot: string, ring: string, hex: string }}
 */
export function getRiskClasses(level) {
  switch (level) {
    case RISK_LEVELS.LOW:
      return {
        text: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        dot: "bg-green-400",
        ring: "ring-green-500/30",
        hex: "#16A34A",
      };
    case RISK_LEVELS.MEDIUM:
      return {
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        dot: "bg-amber-400",
        ring: "ring-amber-500/30",
        hex: "#D97706",
      };
    case RISK_LEVELS.HIGH:
      return {
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        dot: "bg-red-400",
        ring: "ring-red-500/30",
        hex: "#DC2626",
      };
    case RISK_LEVELS.CRITICAL:
      return {
        text: "text-red-500",
        bg: "bg-red-900/20",
        border: "border-red-800/40",
        dot: "bg-red-500",
        ring: "ring-red-800/40",
        hex: "#991B1B",
      };
    default:
      return {
        text: "text-slate-400",
        bg: "bg-slate-800/40",
        border: "border-slate-700/40",
        dot: "bg-slate-500",
        ring: "ring-slate-700/40",
        hex: "#64748B",
      };
  }
}

/**
 * Convenience: derive classes directly from a numeric score.
 *
 * @param {number|null} score
 * @returns {ReturnType<getRiskClasses>}
 */
export function getScoreClasses(score) {
  return getRiskClasses(scoreToLevel(score));
}

/**
 * Human-readable label for a risk level.
 *
 * @param {"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"|null} level
 * @returns {string}
 */
export function riskLevelLabel(level) {
  if (!level) return "Unknown";
  return level.charAt(0) + level.slice(1).toLowerCase(); // "Low", "Medium" etc
}