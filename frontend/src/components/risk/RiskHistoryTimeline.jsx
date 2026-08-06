"use client";

import { motion } from "framer-motion";
import { ChevronDown, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { formatScore, getRiskLevelMeta } from "@/utils/riskUtils";

/**
 * RiskHistoryTimeline — Vertical timeline of all risk assessments.
 *
 * Features:
 *   - Newest first (reverses backend's chronological order)
 *   - Colored dot per assessment (matches risk level)
 *   - Expandable card revealing per-category score grid
 *   - Delta indicator vs previous assessment
 *   - "LATEST" badge on newest
 *   - Relative time + absolute time on hover
 *
 * Design inspired by: Linear activity feed, Vercel deployment history,
 * GitHub commit timeline.
 */
export default function RiskHistoryTimeline({ history }) {
  const { t, i18n } = useTranslation();
  const [expandedIds, setExpandedIds] = useState(() => {
    // Latest assessment expanded by default
    if (!history?.history?.length) return new Set();
    const latest = history.history[history.history.length - 1];
    return new Set([latest.assessmentId]);
  });

  if (!history?.history?.length) return null;

  // Reverse to show newest first (backend returns oldest first)
  const reversed = [...history.history].reverse();

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatRelative = (isoString) => {
    if (!isoString) return "";
    try {
      const now = new Date();
      const then = new Date(isoString);
      const diffMs = now - then;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return t("risk.history.timeJustNow", "just now");
      if (diffMins < 60)
        return t("risk.history.timeMinutesAgo", "{{count}} min ago", {
          count: diffMins,
        });
      if (diffHours < 24)
        return t("risk.history.timeHoursAgo", "{{count}} hr ago", {
          count: diffHours,
        });
      if (diffDays < 30)
        return t("risk.history.timeDaysAgo", "{{count}} d ago", {
          count: diffDays,
        });
      return new Intl.DateTimeFormat(i18n.language || "en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(then);
    } catch {
      return "";
    }
  };

  const formatAbsolute = (isoString) => {
    if (!isoString) return "";
    try {
      return new Intl.DateTimeFormat(i18n.language || "en", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(isoString));
    } catch {
      return "";
    }
  };

  return (
    <div className="px-6 py-5">
      {reversed.map((entry, idx) => {
        const isExpanded = expandedIds.has(entry.assessmentId);
        const isLast = idx === reversed.length - 1;
        const meta = getRiskLevelMeta(entry.overallLevel);

        // Delta vs previous (older) assessment
        // In reversed array, "previous in time" is at idx+1
        const previous = reversed[idx + 1];
        const hasDelta = previous !== undefined;
        const delta = hasDelta
          ? entry.overallScore - previous.overallScore
          : null;
        const isImproved = hasDelta && delta < 0;
        const isWorsened = hasDelta && delta > 0;
        const isFlat = hasDelta && delta === 0;

        return (
          <motion.div
            key={entry.assessmentId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.25 }}
            className="flex gap-4"
          >
            {/* ── Rail with dot ── */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative flex items-center justify-center pt-1.5">
                {entry.isLatest && (
                  <span
                    className="absolute w-5 h-5 rounded-full animate-pulse"
                    style={{
                      backgroundColor: meta.solid,
                      opacity: 0.2,
                    }}
                  />
                )}
                <span
                  className="w-3 h-3 rounded-full border-2 border-white dark:border-[#0d1117] relative z-10"
                  style={{ backgroundColor: meta.solid }}
                />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-gray-200 dark:bg-[#30363d] mt-1" />
              )}
            </div>

            {/* ── Content ── */}
            <div className={`flex-1 ${isLast ? "pb-1" : "pb-6"}`}>
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: meta.solid }}
                    >
                      {t(`risk.levels.${entry.overallLevel}`, entry.overallLevel)}
                    </span>
                    {entry.isLatest && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-600 dark:text-green-400">
                        <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        {t("risk.history.badgeLatest", "Latest")}
                      </span>
                    )}
                    {hasDelta && !isFlat && (
                      <DeltaBadge
                        delta={delta}
                        isImproved={isImproved}
                        isWorsened={isWorsened}
                        t={t}
                      />
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className="text-xl font-black tabular-nums tracking-tight"
                      style={{ color: meta.solid }}
                    >
                      {formatScore(entry.overallScore)}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-[#7d8590]">
                      / 100
                    </span>
                    <span className="text-xs text-gray-500 dark:text-[#7d8590]">
                      · {t("risk.history.assessmentId", "Assessment")} #{entry.assessmentId}
                    </span>
                  </div>

                  <div
                    className="text-xs text-gray-500 dark:text-[#7d8590] mt-1"
                    title={formatAbsolute(entry.calculatedAt)}
                  >
                    {formatRelative(entry.calculatedAt)}
                  </div>
                </div>

                {/* Expand button */}
                <button
                  onClick={() => toggleExpand(entry.assessmentId)}
                  className="flex-shrink-0 p-1.5 rounded-md text-gray-400 dark:text-[#7d8590] hover:bg-gray-100 dark:hover:bg-[#161b22] hover:text-gray-900 dark:hover:text-[#e6edf3] transition-colors"
                  aria-label={
                    isExpanded
                      ? t("risk.history.collapse", "Collapse")
                      : t("risk.history.expand", "Expand")
                  }
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>
              </div>

              {/* Summary */}
              {entry.summary && (
                <p className="text-sm text-gray-600 dark:text-[#c9d1d9] mt-2 leading-relaxed">
                  {entry.summary}
                </p>
              )}

              {/* Expanded per-category grid */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg bg-gray-50 dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d]">
                    <CategoryScore
                      label={t("risk.categories.FLOOD", "Flood")}
                      score={entry.floodScore}
                    />
                    <CategoryScore
                      label={t("risk.categories.LEGAL", "Legal")}
                      score={entry.legalScore}
                    />
                    <CategoryScore
                      label={t("risk.categories.TAX", "Tax")}
                      score={entry.taxScore}
                    />
                    <CategoryScore
                      label={t("risk.categories.ZONING", "Zoning")}
                      score={entry.zoningScore}
                    />
                    <CategoryScore
                      label={t("risk.categories.ENVIRONMENTAL", "Environmental")}
                      score={entry.environmentalScore}
                    />
                    <CategoryScore
                      label={t("risk.categories.MARKET", "Market")}
                      score={entry.marketScore}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   INTERNAL COMPONENTS
   ══════════════════════════════════════════════════════════════ */

function DeltaBadge({ delta, isImproved, isWorsened, t }) {
  const color = isImproved
    ? "#22C55E"
    : isWorsened
    ? "#EF4444"
    : "#7d8590";
  const Icon = isImproved ? TrendingDown : isWorsened ? TrendingUp : Minus;
  const sign = delta > 0 ? "+" : "";

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums"
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
      title={
        isImproved
          ? t("risk.history.deltaImproved", "Risk decreased vs previous")
          : isWorsened
          ? t("risk.history.deltaWorsened", "Risk increased vs previous")
          : t("risk.history.deltaFlat", "No change vs previous")
      }
    >
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      {sign}
      {delta.toFixed(1)}
    </span>
  );
}

function CategoryScore({ label, score }) {
  const level =
    score < 25 ? "LOW" : score < 50 ? "MEDIUM" : score < 75 ? "HIGH" : "CRITICAL";
  const meta = getRiskLevelMeta(level);

  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0d1117] border border-gray-100 dark:border-[#30363d]">
      <span className="text-[11px] text-gray-500 dark:text-[#7d8590] truncate">
        {label}
      </span>
      <span
        className="text-xs font-bold tabular-nums flex-shrink-0 ml-2"
        style={{ color: meta.solid }}
      >
        {formatScore(score)}
      </span>
    </div>
  );
}