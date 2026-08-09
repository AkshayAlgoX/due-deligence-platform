"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatScore, getRiskLevelMeta } from "@/utils/riskUtils";

/**
 * RiskHistoryTimeline — Vertical timeline of all assessments.
 *
 * Session 27 Part 3 upgrades:
 *   - <StyledSummary> parses raw backend text and replaces SHOUTY caps
 *     tokens (LEVELS + CATEGORY names) with colored inline pills.
 *   - Duplicate summary suppression — if an older assessment has the
 *     exact same summary text as a newer one, we hide the paragraph
 *     and show "Same result as Assessment #NN" instead.
 */

const CATEGORY_COLORS = {
  FLOOD:         "#3B82F6",
  LEGAL:         "#A855F7",
  TAX:           "#F59E0B",
  ZONING:        "#6366F1",
  ENVIRONMENTAL: "#22C55E",
  MARKET:        "#F43F5E",
};

const LEVEL_COLORS = {
  LOW:      "#22C55E",
  MEDIUM:   "#F59E0B",
  HIGH:     "#F97316",
  CRITICAL: "#EF4444",
};

// Human-readable versions of the SHOUTY tokens
const CATEGORY_LABELS = {
  FLOOD: "Flood",
  LEGAL: "Legal",
  TAX: "Tax",
  ZONING: "Zoning",
  ENVIRONMENTAL: "Environmental",
  MARKET: "Market",
};

const LEVEL_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export default function RiskHistoryTimeline({ history }) {
  const { t, i18n } = useTranslation();
  const [expandedIds, setExpandedIds] = useState(() => {
    if (!history?.history?.length) return new Set();
    const latest = history.history[history.history.length - 1];
    return new Set([latest.assessmentId]);
  });

  const reversed = useMemo(() => {
    if (!history?.history?.length) return [];
    return [...history.history].reverse();
  }, [history]);

  // Map summary text → first (newest) assessment ID that used it
  // so we can suppress duplicates on older entries.
  const summaryFirstSeen = useMemo(() => {
    const map = new Map();
    reversed.forEach((entry) => {
      const key = (entry.summary || "").trim();
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, entry.assessmentId);
      }
    });
    return map;
  }, [reversed]);

  if (!reversed.length) return null;

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
        return t("risk.history.timeMinutesAgo", "{{count}} min ago", { count: diffMins });
      if (diffHours < 24)
        return t("risk.history.timeHoursAgo", "{{count}} hr ago", { count: diffHours });
      if (diffDays < 30)
        return t("risk.history.timeDaysAgo", "{{count}} d ago", { count: diffDays });
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
    <div className="px-6 py-6">
      {reversed.map((entry, idx) => {
        const isExpanded = expandedIds.has(entry.assessmentId);
        const isLast = idx === reversed.length - 1;
        const meta = getRiskLevelMeta(entry.overallLevel);

        const previous = reversed[idx + 1];
        const hasDelta = previous !== undefined;
        const delta = hasDelta ? entry.overallScore - previous.overallScore : null;
        const isImproved = hasDelta && delta < 0;
        const isWorsened = hasDelta && delta > 0;
        const isFlat = hasDelta && delta === 0;

        const summaryKey = (entry.summary || "").trim();
        const firstSeenId = summaryFirstSeen.get(summaryKey);
        const isDuplicateSummary =
          summaryKey && firstSeenId && firstSeenId !== entry.assessmentId;

        return (
          <motion.div
            key={entry.assessmentId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.25 }}
            className="flex gap-5"
          >
            {/* ══════════════════════════════════════════════
                RAIL WITH DOT
            ══════════════════════════════════════════════ */}
            <div className="flex flex-col items-center flex-shrink-0 relative">
              <div className="relative flex items-center justify-center pt-2">
                {entry.isLatest && (
                  <>
                    <span
                      className="absolute w-8 h-8 rounded-full animate-pulse"
                      style={{ backgroundColor: meta.solid, opacity: 0.15 }}
                    />
                    <span
                      className="absolute w-6 h-6 rounded-full"
                      style={{ backgroundColor: meta.solid, opacity: 0.25 }}
                    />
                  </>
                )}
                <span
                  className="w-4 h-4 rounded-full border-[3px] border-white dark:border-[#161b22] relative z-10 shadow-md"
                  style={{ backgroundColor: meta.solid }}
                />
              </div>
              {!isLast && (
                <div
                  className="w-0.5 flex-1 mt-1"
                  style={{
                    background: `linear-gradient(to bottom, ${meta.solid}55, ${meta.solid}00)`,
                    minHeight: 40,
                  }}
                />
              )}
            </div>

            {/* ══════════════════════════════════════════════
                CONTENT
            ══════════════════════════════════════════════ */}
            <div className={`flex-1 ${isLast ? "pb-2" : "pb-8"} min-w-0`}>
              <div className="rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-4 hover:border-gray-300 dark:hover:border-[#484f58] transition-colors">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest"
                        style={{
                          backgroundColor: `${meta.solid}18`,
                          color: meta.solid,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: meta.solid }}
                        />
                        {t(`risk.levels.${entry.overallLevel}`, entry.overallLevel)}
                      </span>
                      {entry.isLatest && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-green-500/12 text-green-600 dark:text-green-400 border border-green-500/25">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
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

                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className="text-3xl font-black tabular-nums tracking-tight leading-none"
                        style={{ color: meta.solid }}
                      >
                        {formatScore(entry.overallScore)}
                      </span>
                      <span className="text-sm text-gray-400 dark:text-[#6e7681] tabular-nums">
                        / 100
                      </span>
                      <span className="text-xs font-semibold text-gray-500 dark:text-[#7d8590] ml-2">
                        {t("risk.history.assessmentId", "Assessment")} #{entry.assessmentId}
                      </span>
                    </div>

                    <div
                      className="text-xs text-gray-500 dark:text-[#7d8590] mt-2"
                      title={formatAbsolute(entry.calculatedAt)}
                    >
                      {formatRelative(entry.calculatedAt)}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(entry.assessmentId)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#7d8590] hover:bg-gray-100 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-[#e6edf3] transition-colors"
                    aria-label={
                      isExpanded
                        ? t("risk.history.collapse", "Collapse")
                        : t("risk.history.expand", "Expand")
                    }
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" strokeWidth={2} />
                    </motion.div>
                  </button>
                </div>

                {/* ── Summary (styled OR duplicate hint) ── */}
                {entry.summary && (
                  <div className="mt-3">
                    {isDuplicateSummary ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-[#1c2128] border border-gray-200/70 dark:border-[#30363d] text-[11px] font-medium text-gray-500 dark:text-[#7d8590]">
                        <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-[#6e7681]" />
                        {t(
                          "risk.history.sameAsAssessment",
                          "Same result as Assessment"
                        )}{" "}
                        #{firstSeenId}
                      </div>
                    ) : (
                      <StyledSummary text={entry.summary} />
                    )}
                  </div>
                )}

                {/* Expanded per-category grid */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#21262d]">
                        <div className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-[#6e7681] mb-3">
                          {t("risk.history.categoryBreakdown", "Category breakdown")}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <CategoryTile
                            label={t("risk.categories.FLOOD", "Flood")}
                            score={entry.floodScore}
                            color={CATEGORY_COLORS.FLOOD}
                          />
                          <CategoryTile
                            label={t("risk.categories.LEGAL", "Legal")}
                            score={entry.legalScore}
                            color={CATEGORY_COLORS.LEGAL}
                          />
                          <CategoryTile
                            label={t("risk.categories.TAX", "Tax")}
                            score={entry.taxScore}
                            color={CATEGORY_COLORS.TAX}
                          />
                          <CategoryTile
                            label={t("risk.categories.ZONING", "Zoning")}
                            score={entry.zoningScore}
                            color={CATEGORY_COLORS.ZONING}
                          />
                          <CategoryTile
                            label={t("risk.categories.ENVIRONMENTAL", "Environmental")}
                            score={entry.environmentalScore}
                            color={CATEGORY_COLORS.ENVIRONMENTAL}
                          />
                          <CategoryTile
                            label={t("risk.categories.MARKET", "Market")}
                            score={entry.marketScore}
                            color={CATEGORY_COLORS.MARKET}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   StyledSummary — parses raw backend text and replaces SHOUTY
   tokens with colored inline pills. Also lowercases surrounding
   caps so the sentence reads naturally.
   ══════════════════════════════════════════════════════════════ */

function StyledSummary({ text }) {
  // Build one regex that matches any known token (levels + categories)
  const allTokens = [
    ...Object.keys(LEVEL_COLORS),
    ...Object.keys(CATEGORY_COLORS),
  ];
  // Match token as whole-word (word boundaries)
  const pattern = new RegExp(`\\b(${allTokens.join("|")})\\b`, "g");

  const parts = [];
  let lastIndex = 0;
  let match;

  // Reset regex state
  pattern.lastIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    const token = match[1];
    const start = match.index;
    const end = start + token.length;

    // Push preceding plain text
    if (start > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, start) });
    }

    // Push token as pill
    const isLevel = LEVEL_COLORS[token] !== undefined;
    parts.push({
      type: "pill",
      token,
      color: isLevel ? LEVEL_COLORS[token] : CATEGORY_COLORS[token],
      label: isLevel ? LEVEL_LABELS[token] : CATEGORY_LABELS[token],
      isLevel,
    });

    lastIndex = end;
  }

  // Trailing plain text
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return (
    <p className="text-sm leading-[1.7] text-gray-700 dark:text-[#c9d1d9] max-w-3xl">
      {parts.map((part, i) => {
        if (part.type === "text") {
          return <span key={i}>{part.value}</span>;
        }
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold tabular-nums mx-0.5 align-baseline"
            style={{
              backgroundColor: `${part.color}15`,
              color: part.color,
              boxShadow: `inset 0 0 0 1px ${part.color}30`,
            }}
          >
            {part.isLevel && (
              <span
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: part.color }}
              />
            )}
            {part.label}
          </span>
        );
      })}
    </p>
  );
}

/* ══════════════════════════════════════════════════════════════
   DeltaBadge
   ══════════════════════════════════════════════════════════════ */

function DeltaBadge({ delta, isImproved, isWorsened, t }) {
  const color = isImproved ? "#22C55E" : isWorsened ? "#EF4444" : "#7d8590";
  const Icon = isImproved ? TrendingDown : isWorsened ? TrendingUp : Minus;
  const sign = delta > 0 ? "+" : "";

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tabular-nums"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        boxShadow: `inset 0 0 0 1px ${color}30`,
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

/* ══════════════════════════════════════════════════════════════
   CategoryTile — filled colored tile
   ══════════════════════════════════════════════════════════════ */

function CategoryTile({ label, score, color }) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded-lg border"
      style={{
        backgroundColor: `${color}0a`,
        borderColor: `${color}25`,
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-[11px] font-semibold text-gray-700 dark:text-[#c9d1d9] truncate">
          {label}
        </span>
      </div>
      <span
        className="text-xs font-black tabular-nums flex-shrink-0 ml-2"
        style={{ color }}
      >
        {formatScore(score)}
      </span>
    </div>
  );
}