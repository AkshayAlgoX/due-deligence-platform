"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { RefreshCw, Clock, Database } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { formatScore, getRiskLevelMeta, scoreToLevel } from "@/utils/riskUtils";

/**
 * RiskSpectrum — Premium hero score card (Option A: ring-only).
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  [ RING 200px ]   Meta stack        Recalculate btn    │
 *   │   [ 19.3 ]        · Last calc                          │
 *   │   LOW RISK        · Confidence (6 bar signal)          │
 *   │                                                        │
 *   │  ── LOW · MEDIUM · HIGH · CRITICAL (legend row) ──     │
 *   └─────────────────────────────────────────────────────────┘
 */
export default function RiskSpectrum({
  score,
  level,
  onRecalculate,
  recalculating = false,
  lastCalculatedAt,
  availableSources = 6,
  totalSources = 6,
}) {
  const { t } = useTranslation();

  const targetScore = Math.max(0, Math.min(100, Number(score) || 0));
  const derivedLevel = level || scoreToLevel(targetScore);
  const meta = getRiskLevelMeta(derivedLevel);

  // Ring animation
  const animatedScore = useMotionValue(0);
  const springScore = useSpring(animatedScore, { stiffness: 60, damping: 20 });
  const displayScore = useTransform(springScore, (v) => formatScore(v));

  // Ring stroke dashoffset
  const RING_SIZE = 200;
  const RING_STROKE = 14;
  const RADIUS = (RING_SIZE - RING_STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const springOffset = useTransform(
    springScore,
    (v) => CIRCUMFERENCE - (CIRCUMFERENCE * v) / 100
  );

  const prevRecalculating = useRef(false);

  useEffect(() => {
    animatedScore.set(targetScore);
  }, [targetScore, animatedScore]);

  useEffect(() => {
    const wasRecalculating = prevRecalculating.current;
    prevRecalculating.current = recalculating;

    if (wasRecalculating && !recalculating) {
      animatedScore.jump(0);
      requestAnimationFrame(() => {
        animatedScore.set(targetScore);
      });
    }
  }, [recalculating, targetScore, animatedScore]);

  const formatRelative = (iso) => {
    if (!iso) return t("risk.spectrum.justNow", "just now");
    try {
      const diffMs = new Date() - new Date(iso);
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMs / 3600000);
      const diffDay = Math.floor(diffMs / 86400000);
      if (diffMin < 1) return t("risk.spectrum.justNow", "just now");
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      return `${diffDay}d ago`;
    } catch {
      return "";
    }
  };

  const LEVELS = [
    { key: "LOW", range: "0–25", color: "#22C55E" },
    { key: "MEDIUM", range: "26–50", color: "#F59E0B" },
    { key: "HIGH", range: "51–75", color: "#F97316" },
    { key: "CRITICAL", range: "76–100", color: "#EF4444" },
  ];

  return (
    <div className="w-full">
      {/* ═══════════════════════════════════════════════════════
          TOP ROW — Ring + Meta + Recalculate
      ═══════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-10">
        {/* ── CIRCULAR RING BADGE (200px) ─────────────────── */}
        <div className="relative flex items-center justify-center flex-shrink-0 mx-auto lg:mx-0">
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-30"
            style={{ backgroundColor: meta.solid }}
          />

          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className="relative -rotate-90"
          >
            {/* Track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={RING_STROKE}
              className="text-gray-100 dark:text-[#21262d]"
            />
            {/* Gradient def */}
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={meta.solid} stopOpacity="1" />
                <stop offset="100%" stopColor={meta.solid} stopOpacity="0.7" />
              </linearGradient>
            </defs>
            {/* Progress arc */}
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: springOffset }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-5xl font-black tabular-nums tracking-tight leading-none"
              style={{ color: meta.solid }}
            >
              <motion.span>{displayScore}</motion.span>
            </motion.div>
            <div className="text-[10px] font-black uppercase tracking-[0.15em] mt-2 text-gray-500 dark:text-[#7d8590]">
              {t("risk.spectrum.outOf", "out of 100")}
            </div>
            <div
              className="mt-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em]"
              style={{
                backgroundColor: `${meta.solid}18`,
                color: meta.solid,
              }}
            >
              {t(`risk.levels.${derivedLevel}`, derivedLevel)}{" "}
              {t("risk.spectrum.risk", "risk")}
            </div>
          </div>
        </div>

        {/* ── META STACK ─────────────────────────────────── */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Last calculated */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] flex items-center justify-center flex-shrink-0">
              <Clock
                className="w-4 h-4 text-gray-500 dark:text-[#7d8590]"
                strokeWidth={2}
              />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-0.5">
                {t("risk.spectrum.lastCalc", "Last calculated")}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">
                {formatRelative(lastCalculatedAt)}
              </div>
            </div>
          </div>

          {/* Data confidence — UNIQUE SIGNAL BARS */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] flex items-center justify-center flex-shrink-0">
              <Database
                className="w-4 h-4 text-gray-500 dark:text-[#7d8590]"
                strokeWidth={2}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-1.5">
                {t("risk.spectrum.confidence", "Data confidence")}
              </div>
              <div className="flex items-center gap-3">
                <ConfidenceSignal
                  available={availableSources}
                  total={totalSources}
                />
                <div className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] tabular-nums">
                  {availableSources}
                  <span className="text-gray-400 dark:text-[#6e7681] font-normal">
                    /{totalSources}
                  </span>
                  <span className="ml-1.5 text-xs font-medium text-gray-500 dark:text-[#7d8590]">
                    {t("risk.spectrum.sources", "sources verified")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RECALCULATE BUTTON ─────────────────────────── */}
        {typeof onRecalculate === "function" && (
          <motion.button
            type="button"
            onClick={onRecalculate}
            disabled={recalculating}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-[#e6edf3] border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] hover:border-gray-300 dark:hover:border-[#484f58] hover:bg-gray-50 dark:hover:bg-[#252b33] transition-colors disabled:opacity-50 flex-shrink-0 self-start"
          >
            <RefreshCw
              className={`w-4 h-4 ${recalculating ? "animate-spin" : ""}`}
              strokeWidth={2.25}
            />
            {recalculating
              ? t("risk.spectrum.recalculating", "Recalculating…")
              : t("risk.spectrum.recalculate", "Recalculate")}
          </motion.button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          LEVEL LEGEND ROW — subtle, professional
      ═══════════════════════════════════════════════════════ */}
      <div className="mt-8 pt-5 border-t border-gray-100 dark:border-[#21262d]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-[#6e7681]">
            {t("risk.spectrum.scaleLegend", "Risk scale")}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEVELS.map((lvl) => {
              const isActive = lvl.key === derivedLevel;
              return (
                <div
                  key={lvl.key}
                  className="flex items-center gap-2"
                  style={{ opacity: isActive ? 1 : 0.55 }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: lvl.color,
                      boxShadow: isActive ? `0 0 8px ${lvl.color}` : "none",
                    }}
                  />
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: isActive ? lvl.color : undefined }}
                  >
                    {t(`risk.levels.${lvl.key}`, lvl.key)}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-[#6e7681] tabular-nums">
                    {lvl.range}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ConfidenceSignal — 6 vertical bars, signal-strength style
   ══════════════════════════════════════════════════════════════ */

function ConfidenceSignal({ available = 6, total = 6 }) {
  const heights = [8, 12, 16, 20, 24, 28];
  const bars = Array.from({ length: total }, (_, i) => i < available);

  const ratio = total > 0 ? available / total : 0;
  const color =
    ratio >= 0.83 ? "#22C55E" :
    ratio >= 0.5 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex items-end gap-[3px] h-7">
      {bars.map((isOn, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: heights[i] || 28, opacity: 1 }}
          transition={{ delay: i * 0.06, duration: 0.35, ease: "easeOut" }}
          className="w-[5px] rounded-sm"
          style={{
            backgroundColor: isOn ? color : "currentColor",
            opacity: isOn ? 1 : 0.15,
            boxShadow: isOn ? `0 0 6px ${color}55` : "none",
          }}
        />
      ))}
    </div>
  );
}