"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getPortfolioHistory } from "@/services/dashboardService";
import i18n from "@/i18n";

// ── Helpers ───────────────────────────────────────────────────────────────

function formatINRShort(value) {
  // Cr / L are region-specific units (Indian numbering), kept as-is across languages.
  if (value == null) return "—";
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  if (value >= 1_00_000)    return `₹${(value / 1_00_000).toFixed(1)} L`;
  return `₹${value.toLocaleString(i18n.language || "en-IN")}`;
}

function formatDateLabel(dateStr, days, lang) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const locale = lang || "en-IN";
  if (days <= 7) {
    return d.toLocaleDateString(locale, { weekday: "short" });
  }
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-36 rounded-lg bg-gray-100 dark:bg-[#1c2128]" />
          <div className="h-3 w-24 rounded-lg bg-gray-100 dark:bg-[#1c2128]" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-12 rounded-lg bg-gray-100 dark:bg-[#1c2128]" />
          ))}
        </div>
      </div>
      <div className="h-8 w-48 rounded-lg bg-gray-100 dark:bg-[#1c2128]" />
      <div className="h-52 rounded-xl bg-gray-100 dark:bg-[#1c2128]" />
    </div>
  );
}

// ── Custom tooltip (dark-aware) ───────────────────────────────────────────

function CustomTooltip({ active, payload, label, isDark }) {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;

  return (
    <div
      className="min-w-[160px] rounded-xl border p-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      style={{
        background: isDark ? "#1c2128" : "#ffffff",
        borderColor: isDark ? "#30363d" : "#f3f4f6",
      }}
    >
      <p
        className="mb-2 text-xs font-medium"
        style={{ color: isDark ? "#7d8590" : "#9ca3af" }}
      >
        {label}
      </p>
      <p
        className="text-base font-bold"
        style={{ color: isDark ? "#e6edf3" : "#111827" }}
      >
        {formatINRShort(point?.totalValue)}
      </p>
      <div
        className="mt-1.5 flex gap-3 text-xs"
        style={{ color: isDark ? "#7d8590" : "#6b7280" }}
      >
        <span>
          {t("trend.tooltip.propertiesCount", { count: point?.propertyCount ?? 0 })}
        </span>
        <span>
          {t("trend.tooltip.verifiedCount", { count: point?.verifiedCount ?? 0 })}
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
// Window labels (7d/30d/90d) are universal web conventions — kept English.
const WINDOWS = [
  { label: "7d",  days: 7  },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default function PortfolioTrendChart({ refreshKey }) {
  const { t, i18n: i18nInst } = useTranslation();
  const [days, setDays]     = useState(30);
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode for chart axis/grid/dot colors
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const points = await getPortfolioHistory(days);
      setData(points);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const first = data[0]?.totalValue ?? null;
  const last  = data[data.length - 1]?.totalValue ?? null;
  const delta = first != null && last != null && first > 0
    ? ((last - first) / first) * 100
    : null;
  const deltaPositive = delta != null && delta > 0;
  const deltaNeutral  = delta === 0 || delta == null;

  // Re-compute date labels when language changes
  const chartData = useMemo(
    () =>
      data.map((p) => ({
        ...p,
        label: formatDateLabel(p.date, days, i18nInst.language),
      })),
    [data, days, i18nInst.language]
  );

  const tickInterval = days <= 7 ? 0 : days <= 30 ? 4 : 9;

  // Dark-aware chart colors
  const gridStroke = isDark ? "#30363d" : "#f3f4f6";
  const axisTickFill = isDark ? "#7d8590" : "#9ca3af";
  const activeDotStroke = isDark ? "#161b22" : "#ffffff";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      {loading ? (
        <ChartSkeleton />
      ) : error ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400 dark:text-[#7d8590]">
          {t("trend.error.couldntLoad")}{" "}
          <button
            onClick={load}
            className="ml-1 text-[#22C55E] underline underline-offset-2"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818]">
            <TrendingUp size={22} className="text-[#22C55E] dark:text-green-400" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">
              {t("trend.empty.title")}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-[#7d8590] leading-relaxed">
              {t("trend.empty.description")}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6">
          {/* Header row */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">
                {t("trend.title")}
              </h3>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-[#7d8590]">
                {t("trend.dataPointsInWindow", { count: data.length })}
              </p>
            </div>

            {/* Period toggle */}
            <div className="flex items-center gap-1 rounded-xl bg-gray-50 dark:bg-[#0d1117] p-1">
              {WINDOWS.map((w) => (
                <button
                  key={w.days}
                  onClick={() => setDays(w.days)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                    days === w.days
                      ? "bg-white dark:bg-[#1c2128] text-[#16a34a] dark:text-green-400 shadow-sm ring-1 ring-gray-200 dark:ring-[#30363d]"
                      : "text-gray-500 dark:text-[#7d8590] hover:text-gray-700 dark:hover:text-[#e6edf3]"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Delta badge */}
          <div className="mb-6 flex items-end gap-4">
            <span className="text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-[#e6edf3] leading-none">
              {formatINRShort(last)}
            </span>

            {!deltaNeutral && delta != null && (
              <span
                className={`mb-0.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                  deltaPositive
                    ? "bg-[#edf7f3] dark:bg-[#0d2818] text-[#16a34a] dark:text-green-400"
                    : "bg-red-50 dark:bg-[#2d1214] text-red-600 dark:text-red-400"
                }`}
              >
                {deltaPositive ? (
                  <TrendingUp size={12} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={12} strokeWidth={2.5} />
                )}
                {t("trend.deltaVsAgo", {
                  sign: deltaPositive ? "+" : "",
                  pct: delta.toFixed(1),
                  days,
                })}
              </span>
            )}

            {deltaNeutral && data.length > 1 && (
              <span className="mb-0.5 flex items-center gap-1 rounded-full bg-gray-100 dark:bg-[#1c2128] px-2.5 py-1 text-xs font-bold text-gray-500 dark:text-[#7d8590]">
                <Minus size={12} strokeWidth={2.5} />
                {t("trend.noChange")}
              </span>
            )}
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#22C55E" stopOpacity={isDark ? 0.35 : 0.25} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0}    />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridStroke}
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: axisTickFill }}
                axisLine={false}
                tickLine={false}
                interval={tickInterval}
              />

              <YAxis
                tickFormatter={(v) => formatINRShort(v)}
                tick={{ fontSize: 10, fill: axisTickFill }}
                axisLine={false}
                tickLine={false}
                width={64}
                tickCount={4}
              />

              <Tooltip
                content={<CustomTooltip isDark={isDark} />}
                cursor={{
                  stroke: "#22C55E",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />

              <Area
                type="monotone"
                dataKey="totalValue"
                stroke="#22C55E"
                strokeWidth={2.5}
                fill="url(#portfolioGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#22C55E",
                  stroke: activeDotStroke,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}