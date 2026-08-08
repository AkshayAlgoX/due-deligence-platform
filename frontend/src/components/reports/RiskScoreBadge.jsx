// src/components/reports/RiskScoreBadge.jsx
// ---------------------------------------------------------------------------
// Circular badge showing overall risk score on each report row.
// States: score (completed) | spinner (generating/pending) | dash (failed/null)
// ---------------------------------------------------------------------------

"use client";

import { motion } from "framer-motion";
import { getRiskClasses, scoreToLevel, riskLevelLabel } from "@/utils/riskColor";

/**
 * @param {{
 *   score: number|null,
 *   level: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"|null,
 *   status: "PENDING"|"GENERATING"|"COMPLETED"|"FAILED",
 *   size?: "sm"|"md",
 * }} props
 */
export default function RiskScoreBadge({ score, level, status, size = "md" }) {
  // Derive level from score if not provided directly
  const resolvedLevel = level ?? scoreToLevel(score);
  const classes = getRiskClasses(resolvedLevel);

  const isActive = status === "COMPLETED" && score !== null && score !== undefined;
  const isLoading = status === "PENDING" || status === "GENERATING";

  // Size variants
  const dimensions = size === "sm"
    ? { outer: "w-10 h-10", text: "text-xs font-bold", label: "text-[9px]" }
    : { outer: "w-12 h-12", text: "text-sm font-bold", label: "text-[10px]" };

  // ── Loading spinner state ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className={`
          ${dimensions.outer} relative flex items-center justify-center
          rounded-full bg-slate-800/60 border border-slate-700/50
          flex-shrink-0
        `}
        aria-label="Risk score loading"
        title="Calculating risk score…"
      >
        {/* Spinning arc */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="24" cy="24" r="20"
            stroke="#334155"
            strokeWidth="3"
          />
          <path
            d="M24 4 A20 20 0 0 1 44 24"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[10px] text-slate-500 font-medium z-10">…</span>
      </div>
    );
  }

  // ── Failed / no score state ────────────────────────────────────────────
  if (!isActive) {
    return (
      <div
        className={`
          ${dimensions.outer} flex items-center justify-center
          rounded-full bg-slate-800/40 border border-slate-700/30
          flex-shrink-0
        `}
        aria-label="Risk score unavailable"
        title={status === "FAILED" ? "Report failed — no score" : "Score not yet calculated"}
      >
        <span className="text-slate-600 font-semibold text-sm select-none">—</span>
      </div>
    );
  }

  // ── Score display state ────────────────────────────────────────────────
  const displayScore = typeof score === "number" ? score.toFixed(1) : "—";
  const tooltipText = `Risk Score: ${displayScore} — ${riskLevelLabel(resolvedLevel)} risk`;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        ${dimensions.outer} relative flex flex-col items-center justify-center
        rounded-full border flex-shrink-0 cursor-default
        ${classes.bg} ${classes.border}
      `}
      aria-label={tooltipText}
      title={tooltipText}
      role="img"
    >
      {/* Score number */}
      <span className={`${dimensions.text} ${classes.text} leading-none tabular-nums`}>
        {displayScore}
      </span>
      {/* Level label underneath */}
      <span className={`${dimensions.label} ${classes.text} opacity-70 uppercase tracking-wide leading-none mt-0.5`}>
        {riskLevelLabel(resolvedLevel)}
      </span>
    </motion.div>
  );
}