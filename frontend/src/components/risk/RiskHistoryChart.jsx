"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getRiskLevelMeta } from "@/utils/riskUtils";

/**
 * RiskHistoryChart — Score trend area chart with subtle threshold bands.
 *
 * Upgrades:
 *   - Horizontal reference bands (green/amber/orange/red) at ultra-low opacity
 *   - Threshold reference lines still shown for precision
 *   - Larger dot for latest with pulse glow ring
 *   - Better gradient
 */
export default function RiskHistoryChart({ history, height = 260 }) {
  const { t, i18n } = useTranslation();

  const chartData = useMemo(() => {
    if (!history?.history) return [];
    return history.history.map((entry, idx) => ({
      index: idx + 1,
      score: Number(entry.overallScore.toFixed(2)),
      level: entry.overallLevel,
      calculatedAt: entry.calculatedAt,
      isLatest: entry.isLatest,
      assessmentId: entry.assessmentId,
    }));
  }, [history]);

  const currentLevel = history?.currentLevel;
  const currentMeta = getRiskLevelMeta(currentLevel);
  const primaryColor = currentMeta?.solid || "#22C55E";

  const language = i18n.language || "en";

  const formatXAxisDate = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat(language, {
        day: "numeric",
        month: "short",
      }).format(d);
    } catch {
      return "";
    }
  };

  if (chartData.length === 0) return null;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 12, right: 16, left: -18, bottom: 0 }}
        >
          <defs>
            <linearGradient id="riskScoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={0.4} />
              <stop offset="60%" stopColor={primaryColor} stopOpacity={0.12} />
              <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* ── SUBTLE THRESHOLD BANDS ── */}
          <ReferenceArea y1={0} y2={25} fill="#22C55E" fillOpacity={0.04} />
          <ReferenceArea y1={25} y2={50} fill="#F59E0B" fillOpacity={0.04} />
          <ReferenceArea y1={50} y2={75} fill="#F97316" fillOpacity={0.04} />
          <ReferenceArea y1={75} y2={100} fill="#EF4444" fillOpacity={0.05} />

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-gray-100 dark:text-[#21262d]"
            vertical={false}
          />

          <XAxis
            dataKey="calculatedAt"
            tickFormatter={formatXAxisDate}
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-gray-500 dark:text-[#7d8590]"
            axisLine={false}
            tickLine={false}
            dy={8}
          />

          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-gray-500 dark:text-[#7d8590]"
            axisLine={false}
            tickLine={false}
            width={40}
          />

          <ReferenceLine y={25} stroke="#22C55E" strokeDasharray="2 4" strokeOpacity={0.3} />
          <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="2 4" strokeOpacity={0.3} />
          <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="2 4" strokeOpacity={0.3} />

          <Tooltip
            content={(props) => <CustomTooltip {...props} t={t} language={language} />}
            cursor={{
              stroke: primaryColor,
              strokeWidth: 1,
              strokeDasharray: "3 3",
              strokeOpacity: 0.5,
            }}
          />

          <Area
            type="monotone"
            dataKey="score"
            stroke={primaryColor}
            strokeWidth={2.5}
            fill="url(#riskScoreGradient)"
            dot={(props) => <CustomDot {...props} primaryColor={primaryColor} />}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Custom tooltip
   ══════════════════════════════════════════════════════════════ */

function CustomTooltip({ active, payload, t, language }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const meta = getRiskLevelMeta(data.level);

  const formatTooltipDate = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat(language, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return "";
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-xl px-3.5 py-3 min-w-[200px]">
      <div className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-[#6e7681] mb-2">
        {t("risk.history.tooltipAssessment", "Assessment")} #{data.assessmentId}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span
          className="text-3xl font-black tabular-nums tracking-tight"
          style={{ color: meta.solid }}
        >
          {data.score}
        </span>
        <span
          className="text-[10px] uppercase tracking-widest font-black"
          style={{ color: meta.solid }}
        >
          {t(`risk.levels.${data.level}`, data.level)}
        </span>
      </div>
      <div className="text-xs text-gray-500 dark:text-[#7d8590]">
        {formatTooltipDate(data.calculatedAt)}
      </div>
      {data.isLatest && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#30363d]">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {t("risk.history.tooltipLatest", "Latest")}
          </span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Custom dot
   ══════════════════════════════════════════════════════════════ */

function CustomDot({ cx, cy, payload, primaryColor }) {
  if (cx == null || cy == null) return null;
  const meta = getRiskLevelMeta(payload.level);
  const color = meta?.solid || primaryColor;

  return (
    <g>
      {payload.isLatest && (
        <>
          <circle cx={cx} cy={cy} r={11} fill={color} opacity={0.15} className="animate-pulse" />
          <circle cx={cx} cy={cy} r={7} fill={color} opacity={0.3} />
        </>
      )}
      <circle
        cx={cx}
        cy={cy}
        r={payload.isLatest ? 5.5 : 4}
        fill="white"
        stroke={color}
        strokeWidth={payload.isLatest ? 2.5 : 2}
      />
    </g>
  );
}