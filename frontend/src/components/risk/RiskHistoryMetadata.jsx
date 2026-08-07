"use client";

import { motion } from "framer-motion";
import { Activity, ArrowDownRight, ArrowUpRight, Minus, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getRiskLevelMeta, formatScore } from "@/utils/riskUtils";

/**
 * RiskHistoryMetadata — Compact stats bar at the top of RiskHistorySection.
 *
 * Shows:
 *   - Current risk level (colored badge)
 *   - Score delta from baseline (with direction arrow)
 *   - Total assessment count
 *   - First and latest assessment dates
 *
 * Design inspired by: Stripe metric strips, Linear insight bars.
 */
export default function RiskHistoryMetadata({ history }) {
  const { t, i18n } = useTranslation();

  if (!history || !history.history || history.history.length === 0) {
    return null;
  }

  const {
    totalAssessments,
    scoreDelta,
    currentLevel,
    baselineLevel,
    history: entries,
  } = history;

  const currentMeta = getRiskLevelMeta(currentLevel);

  // entries are chronological (oldest first)
  const firstAssessment = entries[0];
  const latestAssessment = entries[entries.length - 1];

  // Delta direction — remember: HIGHER score = MORE risk
  // So delta > 0 = risk INCREASED (bad, red arrow up)
  // delta < 0 = risk DECREASED (good, green arrow down)
  // delta === 0 = no change (gray)
  const hasDelta = scoreDelta !== null && scoreDelta !== undefined;
  const deltaAbs = hasDelta ? Math.abs(scoreDelta) : 0;
  const isImproved = hasDelta && scoreDelta < 0;
  const isWorsened = hasDelta && scoreDelta > 0;
  const isFlat = hasDelta && scoreDelta === 0;

  const deltaColor = isImproved
    ? "#22C55E"
    : isWorsened
    ? "#EF4444"
    : "#7d8590";
  const DeltaIcon = isImproved
    ? ArrowDownRight
    : isWorsened
    ? ArrowUpRight
    : Minus;

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat(i18n.language || "en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
    } catch {
      return "—";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 dark:bg-[#30363d] rounded-xl overflow-hidden border border-gray-200 dark:border-[#30363d]"
    >
      {/* ── CURRENT LEVEL ────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d1117] px-5 py-4">
        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-[#7d8590] mb-2">
          {t("risk.history.metaCurrent", "Current")}
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="text-2xl font-black tabular-nums tracking-tight"
            style={{ color: currentMeta.solid }}
          >
            {formatScore(latestAssessment.overallScore)}
          </span>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: currentMeta.solid }}
          >
            {t(`risk.levels.${currentLevel}`, currentLevel)}
          </span>
        </div>
      </div>

      {/* ── DELTA ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d1117] px-5 py-4">
        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-[#7d8590] mb-2">
          {t("risk.history.metaDelta", "Change")}
        </div>
        <div className="flex items-center gap-1.5">
          <DeltaIcon
            className="w-4 h-4"
            strokeWidth={2.25}
            style={{ color: deltaColor }}
          />
          <span
            className="text-2xl font-black tabular-nums tracking-tight"
            style={{ color: deltaColor }}
          >
            {isFlat ? "0.0" : formatScore(deltaAbs)}
          </span>
        </div>
        <div className="text-[11px] text-gray-500 dark:text-[#7d8590] mt-0.5">
          {isFlat
            ? t("risk.history.metaNoChange", "No change")
            : t("risk.history.metaFromBaseline", "from baseline")}
        </div>
      </div>

      {/* ── TOTAL ASSESSMENTS ────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d1117] px-5 py-4">
        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-[#7d8590] mb-2">
          {t("risk.history.metaAssessments", "Assessments")}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tabular-nums tracking-tight text-gray-900 dark:text-[#e6edf3]">
            {totalAssessments}
          </span>
          <Activity
            className="w-3.5 h-3.5 text-gray-400 dark:text-[#7d8590]"
            strokeWidth={2}
          />
        </div>
        <div className="text-[11px] text-gray-500 dark:text-[#7d8590] mt-0.5">
          {t("risk.history.metaTotalRuns", "total runs")}
        </div>
      </div>

      {/* ── DATE RANGE ───────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d1117] px-5 py-4">
        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-[#7d8590] mb-2">
          {t("risk.history.metaTimespan", "Timespan")}
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar
            className="w-3.5 h-3.5 text-gray-400 dark:text-[#7d8590] flex-shrink-0"
            strokeWidth={2}
          />
          <div className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] truncate">
            {formatDate(firstAssessment.calculatedAt)}
          </div>
        </div>
        <div className="text-[11px] text-gray-500 dark:text-[#7d8590] mt-0.5 truncate">
          {t("risk.history.metaLatest", "Latest")}: {formatDate(latestAssessment.calculatedAt)}
        </div>
      </div>
    </motion.div>
  );
}