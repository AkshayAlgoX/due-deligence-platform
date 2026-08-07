// frontend/src/components/risk/RiskSpectrum.jsx
"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { formatScore, getRiskLevelMeta, scoreToLevel } from "@/utils/riskUtils";

/**
 * RiskSpectrum — horizontal risk severity bar with animated pointer indicator.
 *
 * FIX: Animation now guaranteed to play on every recalculate completion,
 * even if the score value is unchanged, by resetting position to 0
 * and spring-animating back to targetScore.
 */
export default function RiskSpectrum({
  score,
  level,
  onRecalculate,
  recalculating = false,
}) {
  const { t } = useTranslation();

  const targetScore = Math.max(0, Math.min(100, Number(score) || 0));
  const derivedLevel = level || scoreToLevel(targetScore);
  const meta = getRiskLevelMeta(derivedLevel);

  // ── Score number spring (drives the big counter display) ──
  const animatedScore = useMotionValue(0);
  const springScore = useSpring(animatedScore, {
    stiffness: 60,
    damping: 20,
  });
  const displayScore = useTransform(springScore, (v) => formatScore(v));

  // ── Position spring (drives the pointer on the bar) ──
  const animatedPosition = useMotionValue(0);
  const springPosition = useSpring(animatedPosition, {
    stiffness: 80,
    damping: 22,
  });
  const pointerLeft = useTransform(springPosition, (v) => `${v}%`);

  // Track previous recalculating state to detect the true→false transition
  const prevRecalculating = useRef(false);

  // ── On score change: animate score number + pointer ──
  useEffect(() => {
    animatedScore.set(targetScore);
    animatedPosition.set(targetScore);
  }, [targetScore, animatedScore, animatedPosition]);

  // ── On recalculate complete: force replay animation from 0 → score ──
  // This fires when recalculating transitions true → false
  useEffect(() => {
    const wasRecalculating = prevRecalculating.current;
    prevRecalculating.current = recalculating;

    if (wasRecalculating && !recalculating) {
      // Recalculate just finished — reset instantly to 0, then spring to score
      // jump() sets the value without triggering the spring
      animatedScore.jump(0);
      animatedPosition.jump(0);

      // Small RAF delay so the jump registers before the spring target is set
      requestAnimationFrame(() => {
        animatedScore.set(targetScore);
        animatedPosition.set(targetScore);
      });
    }
  }, [recalculating, targetScore, animatedScore, animatedPosition]);

  return (
    <div className="w-full">
      {/* ── Top row: Score + Level label + Recalculate button ── */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-baseline gap-4">
          {/* Big animated score number */}
          <motion.div
            className="text-6xl font-black tabular-nums tracking-tight leading-none"
            style={{ color: meta.solid }}
          >
            <motion.span>{displayScore}</motion.span>
          </motion.div>

          <div className="flex flex-col justify-end pb-1">
            <div
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: meta.solid }}
            >
              {t(`risk.levels.${derivedLevel}`, derivedLevel)}{" "}
              {t("risk.spectrum.risk", "risk")}
            </div>
            <div className="text-xs text-gray-500 dark:text-[#7d8590] mt-1">
              {t("risk.spectrum.outOf", "out of 100")}
            </div>
          </div>
        </div>

        {typeof onRecalculate === "function" && (
          <button
            type="button"
            onClick={onRecalculate}
            disabled={recalculating}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-[#e6edf3] border border-gray-200 dark:border-[#30363d] hover:border-gray-300 dark:hover:border-[#484f58] hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${recalculating ? "animate-spin" : ""}`}
              strokeWidth={2.25}
            />
            {recalculating
              ? t("risk.spectrum.recalculating", "Recalculating…")
              : t("risk.spectrum.recalculate", "Recalculate")}
          </button>
        )}
      </div>

      {/* ── Spectrum bar with 4 colored segments ── */}
      <div className="relative">
        {/* The gradient bar — 4 equal zones */}
        <div className="relative h-3 rounded-full overflow-hidden flex">
          <div className="flex-1" style={{ backgroundColor: "#22C55E" }} />
          <div className="flex-1" style={{ backgroundColor: "#F59E0B" }} />
          <div className="flex-1" style={{ backgroundColor: "#F97316" }} />
          <div className="flex-1" style={{ backgroundColor: "#EF4444" }} />
        </div>

        {/* Animated pointer indicator */}
        <motion.div
          className="absolute top-0 -translate-x-1/2"
          style={{ left: pointerLeft }}
        >
          <div
            className="relative flex flex-col items-center"
            style={{ marginTop: -6 }}
          >
            {/* Circular pip with colored border */}
            <div
              className="w-6 h-6 rounded-full border-4 bg-white dark:bg-[#161b22] shadow-lg"
              style={{ borderColor: meta.solid }}
            />
            {/* Downward stem line */}
            <div
              className="w-0.5 h-4 mt-0.5"
              style={{ backgroundColor: meta.solid }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Labels row under bar ── */}
      <div className="relative mt-8 h-4">
        {[
          { pos: 12.5, label: t("risk.levels.LOW", "Low"), num: "0–25" },
          { pos: 37.5, label: t("risk.levels.MEDIUM", "Medium"), num: "26–50" },
          { pos: 62.5, label: t("risk.levels.HIGH", "High"), num: "51–75" },
          { pos: 87.5, label: t("risk.levels.CRITICAL", "Critical"), num: "76–100" },
        ].map((seg) => (
          <div
            key={seg.pos}
            className="absolute -translate-x-1/2 text-center"
            style={{ left: `${seg.pos}%` }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-[#c9d1d9]">
              {seg.label}
            </div>
            <div className="text-[10px] text-gray-400 dark:text-[#6e7681] tabular-nums mt-0.5">
              {seg.num}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}