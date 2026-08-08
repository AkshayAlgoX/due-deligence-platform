// src/components/reports/RiskScoreBadge.jsx
// ---------------------------------------------------------------------------
// Circular risk badge — score + level label
// ✓ Full light/dark mode
// ✓ Spinner for GENERATING/PENDING, dash for FAILED
// ---------------------------------------------------------------------------

"use client";

import { Loader2 } from "lucide-react";
import { scoreToLevel, RISK_LEVELS } from "@/utils/riskColor";

// Size variants
const SIZE = {
  sm: { outer: "w-12 h-12", text: "text-[13px]", sub: "text-[8px]", ring: 36, stroke: 3 },
  md: { outer: "w-14 h-14", text: "text-[15px]", sub: "text-[9px]", ring: 42, stroke: 3.5 },
};

// Level → color tokens (both modes work since opacity-based)
const LEVEL_COLORS = {
  LOW:      { ring: "#22c55e", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", sub: "text-emerald-500/70 dark:text-emerald-500/60" },
  MEDIUM:   { ring: "#f59e0b", bg: "bg-amber-500/10",   text: "text-amber-600 dark:text-amber-400",   sub: "text-amber-500/70 dark:text-amber-500/60" },
  HIGH:     { ring: "#ef4444", bg: "bg-red-500/10",     text: "text-red-600 dark:text-red-400",     sub: "text-red-500/70 dark:text-red-500/60" },
  CRITICAL: { ring: "#b91c1c", bg: "bg-red-700/10",     text: "text-red-700 dark:text-red-300",     sub: "text-red-600/70 dark:text-red-400/60" },
  NONE:     { ring: "#94a3b8", bg: "bg-slate-500/10",   text: "text-slate-600 dark:text-slate-400", sub: "text-slate-500/70 dark:text-slate-500/60" },
};

export default function RiskScoreBadge({ score, status, size = "sm" }) {
  const sz = SIZE[size] ?? SIZE.sm;
  const isProcessing = status === "GENERATING" || status === "PENDING";
  const isFailed = status === "FAILED";

  // Spinner for processing
  if (isProcessing) {
    return (
      <div
        className={`${sz.outer} flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20`}
        aria-label="Generating report"
      >
        <Loader2 size={16} strokeWidth={2} className="text-blue-500 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  // Dash for failed
  if (isFailed || score === null || score === undefined) {
    return (
      <div
        className={`${sz.outer} flex-shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/20`}
        aria-label="Risk score unavailable"
      >
        <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">—</span>
      </div>
    );
  }

  const level = scoreToLevel(score);
  const colors = LEVEL_COLORS[level] ?? LEVEL_COLORS.NONE;
  const displayLevel = level === "NONE" ? "" : level.charAt(0) + level.slice(1).toLowerCase();

  // SVG ring
  const radius = (sz.ring - sz.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      className={`${sz.outer} relative flex-shrink-0 flex items-center justify-center rounded-full ${colors.bg}`}
      role="img"
      aria-label={`Risk score ${Math.round(score)} — ${displayLevel}`}
    >
      {/* SVG ring */}
      <svg
        width={sz.ring}
        height={sz.ring}
        className="absolute inset-0 m-auto -rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={sz.ring / 2}
          cy={sz.ring / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={sz.stroke}
          className="text-slate-200 dark:text-white/5"
        />
        {/* Progress */}
        <circle
          cx={sz.ring / 2}
          cy={sz.ring / 2}
          r={radius}
          fill="none"
          stroke={colors.ring}
          strokeWidth={sz.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>

      {/* Score text */}
      <div className="relative z-10 flex flex-col items-center leading-none">
        <span className={`${sz.text} font-bold ${colors.text} tabular-nums`}>
          {Math.round(score)}
        </span>
        {displayLevel && (
          <span className={`${sz.sub} font-semibold uppercase tracking-wide ${colors.sub}`}>
            {displayLevel}
          </span>
        )}
      </div>
    </div>
  );
}