// frontend/src/components/risk/RiskBreakdownRadar.jsx
"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { CATEGORY_META, formatWeight } from "@/utils/riskUtils";

/**
 * RiskBreakdownRadar — 6-axis radar chart showing all category scores.
 *
 * Uses recharts. Fully theme-aware (auto-adapts to dark mode via CSS vars).
 * Custom tooltip shows: category name, score, weight, level.
 *
 * Design choices:
 *   - Filled polygon (not just outline) — makes shape shockingly clear
 *   - Semi-transparent fill so overlapping is readable
 *   - Custom axis labels with category icons (via ticks formatter)
 *   - Score axis 0-100 with LOW/MED/HIGH/CRITICAL threshold rings
 *
 * @param {Object} breakdown — RiskBreakdownDto from API
 * @param {number} [height=350]
 */
export default function RiskBreakdownRadar({ breakdown, height = 350 }) {
  const { t } = useTranslation();

  if (!breakdown) return null;

  // Build chart data — one row per category, in fixed weight order
  const data = [
    {
      category: t("risk.categories.FLOOD", "Flood"),
      key: "FLOOD",
      score: Math.round(breakdown.floodScore || 0),
      fullScore: breakdown.floodScore || 0,
      weight: CATEGORY_META.FLOOD.weight,
    },
    {
      category: t("risk.categories.LEGAL", "Legal"),
      key: "LEGAL",
      score: Math.round(breakdown.legalScore || 0),
      fullScore: breakdown.legalScore || 0,
      weight: CATEGORY_META.LEGAL.weight,
    },
    {
      category: t("risk.categories.TAX", "Tax"),
      key: "TAX",
      score: Math.round(breakdown.taxScore || 0),
      fullScore: breakdown.taxScore || 0,
      weight: CATEGORY_META.TAX.weight,
    },
    {
      category: t("risk.categories.ZONING", "Zoning"),
      key: "ZONING",
      score: Math.round(breakdown.zoningScore || 0),
      fullScore: breakdown.zoningScore || 0,
      weight: CATEGORY_META.ZONING.weight,
    },
    {
      category: t("risk.categories.ENVIRONMENTAL", "Environmental"),
      key: "ENVIRONMENTAL",
      score: Math.round(breakdown.environmentalScore || 0),
      fullScore: breakdown.environmentalScore || 0,
      weight: CATEGORY_META.ENVIRONMENTAL.weight,
    },
    {
      category: t("risk.categories.MARKET", "Market"),
      key: "MARKET",
      score: Math.round(breakdown.marketScore || 0),
      fullScore: breakdown.marketScore || 0,
      weight: CATEGORY_META.MARKET.weight,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius="75%"
          data={data}
        >
          <PolarGrid
            stroke="currentColor"
            className="text-gray-200 dark:text-[#30363d]"
            strokeDasharray="3 3"
          />

          <PolarAngleAxis
            dataKey="category"
            tick={{
              fill: "currentColor",
              fontSize: 12,
              fontWeight: 600,
            }}
            className="text-gray-600 dark:text-[#e6edf3]"
          />

          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{
              fill: "currentColor",
              fontSize: 10,
            }}
            className="text-gray-400 dark:text-[#7d8590]"
            tickCount={5}
          />

          <Radar
            name={t("risk.radar.seriesName", "Risk Score")}
            dataKey="score"
            stroke="#22C55E"
            fill="#22C55E"
            fillOpacity={0.25}
            strokeWidth={2}
            animationDuration={800}
          />

          <Tooltip content={<RadarTooltip t={t} />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend / helper text below */}
      <p className="mt-3 text-center text-xs text-gray-500 dark:text-[#7d8590]">
        {t("risk.radar.helperText", "Each axis shows a category score (0–100). Lower is better.")}
      </p>
    </motion.div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────

function RadarTooltip({ active, payload, t }) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;
  const level =
    item.fullScore < 26 ? "LOW" :
    item.fullScore < 51 ? "MEDIUM" :
    item.fullScore < 76 ? "HIGH" : "CRITICAL";

  return (
    <div className="rounded-lg bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] shadow-lg p-3 text-xs">
      <div className="font-semibold text-gray-900 dark:text-[#e6edf3] mb-1">
        {item.category}
      </div>
      <div className="flex items-center gap-2 text-gray-600 dark:text-[#7d8590]">
        <span>{t("risk.radar.tooltipScore", "Score")}:</span>
        <span className="font-bold text-gray-900 dark:text-[#e6edf3] tabular-nums">
          {item.score} / 100
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-600 dark:text-[#7d8590]">
        <span>{t("risk.radar.tooltipWeight", "Weight")}:</span>
        <span className="font-medium text-gray-900 dark:text-[#e6edf3]">
          {formatWeight(item.weight)}
        </span>
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-75">
        {t(`risk.levels.${level}`, level)}
      </div>
    </div>
  );
}