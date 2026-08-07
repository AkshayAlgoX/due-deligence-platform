// frontend/src/components/risk/RiskBadge.jsx
"use client";

import { motion } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatScore, getRiskLevelMeta, scoreToLevel } from "@/utils/riskUtils";

/**
 * RiskBadge — compact risk indicator for cards, lists, tables.
 *
 * Three sizes:
 *   sm  — used in dense property cards (h-6)
 *   md  — default (h-8)
 *   lg  — hero contexts (h-10)
 *
 * Renders NOTHING when score is null/undefined — no "unknown" badges
 * cluttering the UI. Callers can pass fallback if needed.
 *
 * Fully i18n-aware — level text pulled from risk.levels.*
 */
export default function RiskBadge({
  score,
  level,
  size = "md",
  showLabel = true,
  showScore = true,
  className = "",
  onClick,
  ariaLabel,
}) {
  const { t } = useTranslation();

  // Nothing to render
  if (score == null && !level) return null;

  const derivedLevel = level || scoreToLevel(score);
  const meta = getRiskLevelMeta(derivedLevel);

  // Icon per level
  const Icon =
    derivedLevel === "LOW" ? ShieldCheck :
    derivedLevel === "MEDIUM" ? Shield :
    derivedLevel === "HIGH" ? ShieldAlert :
    derivedLevel === "CRITICAL" ? ShieldX :
    Shield;

  const sizeClasses = {
    sm: {
      wrap: "h-6 px-2 gap-1 text-[11px]",
      icon: "w-3 h-3",
    },
    md: {
      wrap: "h-8 px-3 gap-1.5 text-xs",
      icon: "w-3.5 h-3.5",
    },
    lg: {
      wrap: "h-10 px-4 gap-2 text-sm",
      icon: "w-4 h-4",
    },
  }[size] || { wrap: "h-8 px-3 gap-1.5 text-xs", icon: "w-3.5 h-3.5" };

  const interactive = typeof onClick === "function";

  const content = (
    <>
      <Icon className={sizeClasses.icon} strokeWidth={2.25} />
      {showScore && score != null && (
        <span className="font-bold tabular-nums">
          {formatScore(score)}
        </span>
      )}
      {showLabel && (
        <span className="font-semibold uppercase tracking-wide">
          {t(`risk.levels.${derivedLevel}`, derivedLevel)}
        </span>
      )}
    </>
  );

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-full border font-medium
    transition-all duration-200
    ${meta.bg} ${meta.bgDark}
    ${meta.text} ${meta.textDark}
    ${meta.border} ${meta.borderDark}
    ${sizeClasses.wrap}
    ${interactive ? "cursor-pointer hover:shadow-md hover:scale-105 active:scale-95" : ""}
    ${className}
  `.trim();

  if (interactive) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        className={baseClasses}
        aria-label={ariaLabel || t("risk.badge.ariaLabel", "Risk level: {{level}}", { level: derivedLevel })}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.95 }}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <span
      className={baseClasses}
      aria-label={ariaLabel || t("risk.badge.ariaLabel", "Risk level: {{level}}", { level: derivedLevel })}
    >
      {content}
    </span>
  );
}