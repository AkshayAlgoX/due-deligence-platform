"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Equal,
  Shield,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { getRiskLevelMeta, formatScore } from "@/utils/riskUtils";

/**
 * RiskHistoryMetadata — 4 KPI stat cards with filled colored icon tiles.
 *
 * Cards:
 *   - CURRENT     → colored by level (Shield icon)
 *   - CHANGE      → colored by direction (Arrow icon)
 *   - ASSESSMENTS → blue (Activity icon)
 *   - TIMESPAN    → purple (Calendar icon)
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
    history: entries,
  } = history;

  const currentMeta = getRiskLevelMeta(currentLevel);

  const firstAssessment = entries[0];
  const latestAssessment = entries[entries.length - 1];

  // Delta direction — higher = more risk = worse
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
    : Equal;

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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* ── CURRENT LEVEL ────────────────────────────────── */}
      <StatCard
        label={t("risk.history.metaCurrent", "Current")}
        icon={Shield}
        iconColor={currentMeta.solid}
        iconBgHex={`${currentMeta.solid}18`}
        iconBorderHex={`${currentMeta.solid}35`}
      >
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            className="text-3xl font-black tabular-nums tracking-tight leading-none"
            style={{ color: currentMeta.solid }}
          >
            {formatScore(latestAssessment.overallScore)}
          </span>
          <span
            className="text-xs font-black uppercase tracking-widest"
            style={{ color: currentMeta.solid }}
          >
            {t(`risk.levels.${currentLevel}`, currentLevel)}
          </span>
        </div>
        <div className="text-[11px] text-gray-500 dark:text-[#7d8590] mt-1.5">
          {t("risk.history.metaCurrentSub", "Overall risk score")}
        </div>
      </StatCard>

      {/* ── DELTA ────────────────────────────────────────── */}
      <StatCard
        label={t("risk.history.metaDelta", "Change")}
        icon={DeltaIcon}
        iconColor={deltaColor}
        iconBgHex={`${deltaColor}18`}
        iconBorderHex={`${deltaColor}35`}
      >
        <div className="flex items-baseline gap-1.5">
          {!isFlat && (
            <span
              className="text-2xl font-black tabular-nums leading-none"
              style={{ color: deltaColor }}
            >
              {isImproved ? "−" : "+"}
            </span>
          )}
          <span
            className="text-3xl font-black tabular-nums tracking-tight leading-none"
            style={{ color: deltaColor }}
          >
            {isFlat ? "0.0" : formatScore(deltaAbs)}
          </span>
        </div>
        <div className="text-[11px] text-gray-500 dark:text-[#7d8590] mt-1.5">
          {isFlat
            ? t("risk.history.metaNoChange", "No change from baseline")
            : isImproved
            ? t("risk.history.metaImprovedFromBaseline", "Improved from baseline")
            : t("risk.history.metaWorsenedFromBaseline", "Higher than baseline")}
        </div>
      </StatCard>

      {/* ── TOTAL ASSESSMENTS ────────────────────────────── */}
      <StatCard
        label={t("risk.history.metaAssessments", "Assessments")}
        icon={Activity}
        iconColor="#3B82F6"
        iconBgHex="#3B82F618"
        iconBorderHex="#3B82F635"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tabular-nums tracking-tight leading-none text-gray-900 dark:text-[#e6edf3]">
            {totalAssessments}
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
            {totalAssessments === 1
              ? t("risk.history.metaTotalRun", "run")
              : t("risk.history.metaTotalRuns", "runs")}
          </span>
        </div>
        <div className="text-[11px] text-gray-500 dark:text-[#7d8590] mt-1.5">
          {t("risk.history.metaAssessmentsSub", "Recalculations performed")}
        </div>
      </StatCard>

      {/* ── DATE RANGE ───────────────────────────────────── */}
      <StatCard
        label={t("risk.history.metaTimespan", "Timespan")}
        icon={Calendar}
        iconColor="#A855F7"
        iconBgHex="#A855F718"
        iconBorderHex="#A855F735"
      >
        <div className="text-lg font-bold text-gray-900 dark:text-[#e6edf3] leading-tight truncate">
          {formatDate(latestAssessment.calculatedAt)}
        </div>
        <div className="text-[11px] text-gray-500 dark:text-[#7d8590] mt-1.5 truncate">
          {t("risk.history.metaSince", "Since")} {formatDate(firstAssessment.calculatedAt)}
        </div>
      </StatCard>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   StatCard — shared shell
   ══════════════════════════════════════════════════════════════ */

function StatCard({ label, icon: Icon, iconColor, iconBgHex, iconBorderHex, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm p-5 min-h-[128px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-[#6e7681]">
          {label}
        </span>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: iconBgHex,
            boxShadow: `inset 0 0 0 1px ${iconBorderHex}`,
          }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} strokeWidth={2.25} />
        </div>
      </div>
      {children}
    </div>
  );
}