"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
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
import { getAreaAverage } from "@/utils/mockAreaAverage";

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

/**
 * RiskBreakdownRadar — Premium dual-overlay radar.
 * Property polygon: solid green with drop-shadow glow.
 * Area average: grey dashed outline.
 */
export default function RiskBreakdownRadar({ breakdown, propertyId, height = 350 }) {
  const { t } = useTranslation();
  const isDark = useIsDark();

  // Mode-aware colors — MUCH stronger contrast now
  const gridStroke     = isDark ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.22)";
  const gridStrokeSoft = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.10)";
  const axisTick       = isDark ? "#c9d1d9" : "#334155";
  const radiusTick     = isDark ? "#6e7681" : "#94a3b8";
  const areaStroke     = isDark ? "#8b949e" : "#94a3b8";
  const tooltipBg      = isDark ? "#161b22" : "#ffffff";
  const tooltipBorder  = isDark ? "#30363d" : "#e2e8f0";
  const tooltipText    = isDark ? "#e6edf3" : "#0f172a";

  const areaAvg = useMemo(() => getAreaAverage(propertyId), [propertyId]);

  if (!breakdown) return null;

  const data = [
    { category: t("risk.categories.FLOOD", "Flood"),                 key: "FLOOD",         score: Math.round(breakdown.floodScore || 0),         areaScore: Math.round(areaAvg.floodScore),         weight: CATEGORY_META.FLOOD.weight },
    { category: t("risk.categories.LEGAL", "Legal"),                 key: "LEGAL",         score: Math.round(breakdown.legalScore || 0),         areaScore: Math.round(areaAvg.legalScore),         weight: CATEGORY_META.LEGAL.weight },
    { category: t("risk.categories.TAX", "Tax"),                     key: "TAX",           score: Math.round(breakdown.taxScore || 0),           areaScore: Math.round(areaAvg.taxScore),           weight: CATEGORY_META.TAX.weight },
    { category: t("risk.categories.ZONING", "Zoning"),               key: "ZONING",        score: Math.round(breakdown.zoningScore || 0),        areaScore: Math.round(areaAvg.zoningScore),        weight: CATEGORY_META.ZONING.weight },
    { category: t("risk.categories.ENVIRONMENTAL", "Environmental"), key: "ENVIRONMENTAL", score: Math.round(breakdown.environmentalScore || 0), areaScore: Math.round(areaAvg.environmentalScore), weight: CATEGORY_META.ENVIRONMENTAL.weight },
    { category: t("risk.categories.MARKET", "Market"),               key: "MARKET",        score: Math.round(breakdown.marketScore || 0),        areaScore: Math.round(areaAvg.marketScore),        weight: CATEGORY_META.MARKET.weight },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <defs>
            {/* Vibrant radial gradient for property polygon */}
            <radialGradient id="propGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#22C55E" stopOpacity={0.15} />
              <stop offset="50%"  stopColor="#22C55E" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#16a34a" stopOpacity={0.7} />
            </radialGradient>
          </defs>

          {/* Solid grid — visible in both modes */}
          <PolarGrid
            stroke={gridStroke}
            strokeWidth={1}
            gridType="polygon"
          />

          <PolarAngleAxis
            dataKey="category"
            tick={{
              fill: axisTick,
              fontSize: 12,
              fontWeight: 700,
            }}
          />

          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{
              fill: radiusTick,
              fontSize: 10,
              fontWeight: 600,
            }}
            tickCount={5}
            axisLine={false}
            stroke="transparent"
          />

          {/* Area average — dashed grey outline */}
          <Radar
            name="areaAvg"
            dataKey="areaScore"
            stroke={areaStroke}
            fill={areaStroke}
            fillOpacity={0.06}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            isAnimationActive={true}
            animationDuration={900}
          />

          {/* Property polygon — bold green with drop-shadow glow */}
          <Radar
            name="property"
            dataKey="score"
            stroke="#16a34a"
            fill="url(#propGradient)"
            fillOpacity={1}
            strokeWidth={3}
            style={{ filter: "drop-shadow(0 0 6px rgba(34,197,94,0.55))" }}
            isAnimationActive={true}
            animationDuration={1000}
          />

          <Tooltip
            content={
              <RadarTooltip
                t={t}
                tooltipBg={tooltipBg}
                tooltipBorder={tooltipBorder}
                tooltipText={tooltipText}
              />
            }
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-5">
        <div className="flex items-center gap-2">
          <span className="relative flex items-center">
            <span className="w-3 h-3 rounded-sm bg-[#22C55E]" />
            <span className="absolute inset-0 rounded-sm bg-[#22C55E] blur-sm opacity-60" />
          </span>
          <span className="text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">
            {t("risk.radar.legendProperty", "This property")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-gray-400 dark:border-[#7d8590]" />
          <span className="text-xs font-semibold text-gray-500 dark:text-[#7d8590]">
            {t("risk.radar.legendArea", "Area average")}
          </span>
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-gray-400 dark:text-[#6e7681]">
        {t("risk.radar.helperText", "Each axis shows a category score (0–100). Lower is better.")}
      </p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Custom tooltip
   ══════════════════════════════════════════════════════════════ */

function RadarTooltip({ active, payload, t, tooltipBg, tooltipBorder, tooltipText }) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;
  const delta = item.score - item.areaScore;
  const isBetter = delta < 0;
  const isWorse = delta > 0;
  const deltaColor = isBetter ? "#22C55E" : isWorse ? "#EF4444" : "#7d8590";
  const deltaLabel =
    delta === 0
      ? t("risk.radar.tooltipSameAsArea", "Same as area avg")
      : isBetter
      ? t("risk.radar.tooltipBetter", "{{n}} pts below area avg", { n: Math.abs(delta) })
      : t("risk.radar.tooltipWorse", "{{n}} pts above area avg", { n: Math.abs(delta) });

  const level =
    item.score < 26 ? "LOW" :
    item.score < 51 ? "MEDIUM" :
    item.score < 76 ? "HIGH" : "CRITICAL";

  return (
    <div
      className="rounded-xl border shadow-xl px-3.5 py-3 min-w-[200px]"
      style={{ background: tooltipBg, borderColor: tooltipBorder }}
    >
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-[#21262d]">
        <span className="text-sm font-bold" style={{ color: tooltipText }}>
          {item.category}
        </span>
        <span
          className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
          style={{
            backgroundColor:
              level === "LOW"    ? "#22C55E20" :
              level === "MEDIUM" ? "#F59E0B20" :
              level === "HIGH"   ? "#F9731620" : "#EF444420",
            color:
              level === "LOW"    ? "#22C55E" :
              level === "MEDIUM" ? "#F59E0B" :
              level === "HIGH"   ? "#F97316" : "#EF4444",
          }}
        >
          {t(`risk.levels.${level}`, level)}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-[#22C55E]" />
            <span className="text-gray-600 dark:text-[#7d8590]">
              {t("risk.radar.tooltipYours", "Your property")}
            </span>
          </div>
          <span className="font-bold tabular-nums" style={{ color: tooltipText }}>
            {item.score}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-0.5 border-t border-dashed border-gray-400 dark:border-[#7d8590]" />
            <span className="text-gray-600 dark:text-[#7d8590]">
              {t("risk.radar.tooltipArea", "Area avg")}
            </span>
          </div>
          <span className="font-semibold text-gray-500 dark:text-[#7d8590] tabular-nums">
            {item.areaScore}
          </span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#21262d]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]">
            {t("risk.radar.tooltipWeight", "Weight")}
          </span>
          <span className="text-[11px] font-semibold text-gray-700 dark:text-[#c9d1d9] tabular-nums">
            {formatWeight(item.weight)}
          </span>
        </div>
        <div
          className="mt-1 text-[11px] font-bold tabular-nums"
          style={{ color: deltaColor }}
        >
          {deltaLabel}
        </div>
      </div>
    </div>
  );
}