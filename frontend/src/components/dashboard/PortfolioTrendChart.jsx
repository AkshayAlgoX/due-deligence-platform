"use client";

import { useEffect, useState, useCallback } from "react";
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

// ── Helpers ───────────────────────────────────────────────────────────────

function formatINRShort(value) {
  if (value == null) return "—";
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  if (value >= 1_00_000)    return `₹${(value / 1_00_000).toFixed(1)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatDateLabel(dateStr, days) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (days <= 7) {
    return d.toLocaleDateString("en-IN", { weekday: "short" }); // Mon
  }
  if (days <= 30) {
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }); // 1 Jul
  }
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }); // 1 Jul
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-36 rounded-lg bg-gray-100" />
          <div className="h-3 w-24 rounded-lg bg-gray-100" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-12 rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
      {/* Delta row */}
      <div className="h-8 w-48 rounded-lg bg-gray-100" />
      {/* Chart area */}
      <div className="h-52 rounded-xl bg-gray-100" />
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, days }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;

  return (
    <div className="min-w-[160px] rounded-xl border border-gray-100 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <p className="mb-2 text-xs font-medium text-gray-400">
        {label}
      </p>
      <p className="text-base font-bold text-gray-900">
        {formatINRShort(point?.totalValue)}
      </p>
      <div className="mt-1.5 flex gap-3 text-xs text-gray-500">
        <span>{point?.propertyCount} properties</span>
        <span>{point?.verifiedCount} verified</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

const WINDOWS = [
  { label: "7d",  days: 7  },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default function PortfolioTrendChart({ refreshKey }) {
  const [days, setDays]     = useState(30);
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

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

  // ── Delta calculation ─────────────────────────────────────────
  const first = data[0]?.totalValue ?? null;
  const last  = data[data.length - 1]?.totalValue ?? null;
  const delta = first != null && last != null && first > 0
    ? ((last - first) / first) * 100
    : null;
  const deltaPositive = delta != null && delta > 0;
  const deltaNeutral  = delta === 0 || delta == null;

  // ── Formatted data for Recharts ───────────────────────────────
  const chartData = data.map((p) => ({
    ...p,
    label: formatDateLabel(p.date, days),
  }));

  // ── Tick interval so labels don't crowd ───────────────────────
  const tickInterval = days <= 7 ? 0 : days <= 30 ? 4 : 9;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      {loading ? (
        <ChartSkeleton />
      ) : error ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Could not load trend data.{" "}
          <button
            onClick={load}
            className="ml-1 text-[#22C55E] underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      ) : data.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────── */
        <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf7f3]">
            <TrendingUp size={22} className="text-[#22C55E]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Tracking starts today
            </p>
            <p className="mt-1 text-xs text-gray-400 leading-relaxed">
              Check back tomorrow to see your portfolio value trend.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6">
          {/* ── Header row ──────────────────────────────────── */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Portfolio value over time
              </h3>
              <p className="mt-0.5 text-xs text-gray-400">
                {data.length} data point{data.length !== 1 ? "s" : ""} in
                selected window
              </p>
            </div>

            {/* Period toggle */}
            <div className="flex items-center gap-1 rounded-xl bg-gray-50 p-1">
              {WINDOWS.map((w) => (
                <button
                  key={w.days}
                  onClick={() => setDays(w.days)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                    days === w.days
                      ? "bg-white text-[#16a34a] shadow-sm ring-1 ring-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Delta badge ─────────────────────────────────── */}
          <div className="mb-6 flex items-end gap-4">
            <span className="text-[28px] font-extrabold tracking-tight text-gray-900 leading-none">
              {formatINRShort(last)}
            </span>

            {!deltaNeutral && delta != null && (
              <span
                className={`mb-0.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                  deltaPositive
                    ? "bg-[#edf7f3] text-[#16a34a]"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {deltaPositive ? (
                  <TrendingUp size={12} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={12} strokeWidth={2.5} />
                )}
                {deltaPositive ? "+" : ""}
                {delta.toFixed(1)}% vs {days}d ago
              </span>
            )}

            {deltaNeutral && data.length > 1 && (
              <span className="mb-0.5 flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">
                <Minus size={12} strokeWidth={2.5} />
                No change
              </span>
            )}
          </div>

          {/* ── Chart ───────────────────────────────────────── */}
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#22C55E" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0}    />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                interval={tickInterval}
              />

             <YAxis
  tickFormatter={(v) => formatINRShort(v)}
  tick={{ fontSize: 10, fill: "#9ca3af" }}
  axisLine={false}
  tickLine={false}
  width={64}
  tickCount={4}
/>
              <Tooltip
                content={<CustomTooltip days={days} />}
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
                  stroke: "#fff",
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