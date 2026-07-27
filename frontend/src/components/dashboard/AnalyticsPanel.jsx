"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { getDashboardAnalytics } from "@/services/dashboardService";

// ── Constants ───────────────────────────────────────────────────

const GREEN = "#22C55E";
const AMBER = "#f59e0b";
const RED = "#ef4444";

// ── Helpers ─────────────────────────────────────────────────────

function formatINRShort(value) {
  if (value == null) return "—";
  if (value >= 1_00_00_000) {
    return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (value >= 1_00_000) {
    return `₹${(value / 1_00_000).toFixed(1)} L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatINRExact(value) {
  if (value == null) return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function getVerificationColor(rate) {
  if (rate > 80) return GREEN;
  if (rate >= 50) return AMBER;
  return RED;
}

// ── Skeleton ────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 p-4 sm:gap-6 sm:p-6 lg:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-gray-100 bg-white p-6"
        >
          <div className="animate-pulse">
            <div className="mb-6 h-4 w-40 rounded bg-gray-100" />
            <div className="h-56 rounded-xl bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty chart state ───────────────────────────────────────────

function EmptyChartState() {
  return (
    <div className="flex h-56 items-center justify-center">
      <p className="text-sm text-gray-400">Not enough data yet</p>
    </div>
  );
}

// ── Tooltips ────────────────────────────────────────────────────

function ValueTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <p className="text-xs font-semibold text-gray-900">{item?.type}</p>
      <p className="mt-1 text-xs font-bold tabular-nums text-[#16a34a]">
        {formatINRExact(item?.avgValue)}
      </p>
    </div>
  );
}

function PriceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <p className="text-xs font-semibold text-gray-900">{item?.city}</p>
      <p className="mt-1 text-xs font-bold tabular-nums text-[#16a34a]">
        ₹{Number(item?.pricePerSqft ?? 0).toLocaleString("en-IN")}/sqft
      </p>
    </div>
  );
}

function VerificationTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <p className="text-xs font-semibold text-gray-900">{item?.city}</p>
      <p className="mt-1 text-xs font-bold tabular-nums text-gray-700">
        {item?.rate ?? 0}% verified
      </p>
    </div>
  );
}

// ── Average value by type ───────────────────────────────────────

function AverageValueChart({ data }) {
  return (
    <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
      <h4 className="text-sm font-bold text-gray-900">
        Average value by type
      </h4>

      <p className="mt-0.5 text-xs text-gray-500">
        Average property value by category
      </p>

      {data.length === 0 ? (
        <EmptyChartState />
      ) : (
        <div className="mt-6 h-56 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />

              <XAxis
                dataKey="type"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tickFormatter={formatINRShort}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={68}
              />

              <Tooltip
                content={<ValueTooltip />}
                cursor={{ fill: "#f9fafb" }}
              />

              <Bar
                dataKey="avgValue"
                fill={GREEN}
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

// ── Price per sqft ──────────────────────────────────────────────

function PricePerSqftChart({ data }) {
  const chartData = data.slice(0, 6);

  return (
    <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
      <h4 className="text-sm font-bold text-gray-900">
        Price per sqft by top cities
      </h4>

      <p className="mt-0.5 text-xs text-gray-500">
        Average price per square foot
      </p>

      {chartData.length === 0 ? (
        <EmptyChartState />
      ) : (
        <div className="mt-6 h-56 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />

              <XAxis
                dataKey="city"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tickFormatter={(value) =>
                  Number(value).toLocaleString("en-IN")
                }
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={58}
              />

              <Tooltip
                content={<PriceTooltip />}
                cursor={{ fill: "#f9fafb" }}
              />

              <Bar
                dataKey="pricePerSqft"
                fill={GREEN}
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

// ── Verification rate ───────────────────────────────────────────

function VerificationRateChart({ data }) {
  const chartData = data.slice(0, 6);

  return (
    <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
      <h4 className="text-sm font-bold text-gray-900">
        Verification rate by city
      </h4>

      <p className="mt-0.5 text-xs text-gray-500">
        Percentage of verified properties
      </p>

      {chartData.length === 0 ? (
        <EmptyChartState />
      ) : (
        <div className="mt-6 h-56 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 38, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                horizontal={false}
              />

              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="city"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={75}
              />

              <Tooltip
                content={<VerificationTooltip />}
                cursor={{ fill: "#f9fafb" }}
              />

              <Bar
                dataKey="rate"
                radius={[0, 6, 6, 0]}
                maxBarSize={24}
              >
                {chartData.map((item) => (
                  <Cell
                    key={item.city}
                    fill={getVerificationColor(item.rate)}
                  />
                ))}

                <LabelList
                  dataKey="rate"
                  position="right"
                  formatter={(value) => `${value}%`}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    fill: "#6b7280",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

// ── Portfolio concentration ─────────────────────────────────────

function PortfolioConcentration({ data }) {
  if (!data) {
    return (
      <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
        <h4 className="text-sm font-bold text-gray-900">
          Portfolio concentration
        </h4>
        <EmptyChartState />
      </section>
    );
  }

  const pct = Math.min(100, Math.max(0, Number(data.pct) || 0));
  const totalProperties =
    pct > 0 ? Math.round((Number(data.propertyCount) / pct) * 100) : 0;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h4 className="text-sm font-bold text-gray-900">
        Portfolio concentration
      </h4>

      <p className="mt-0.5 text-xs text-gray-500">
        Share held in your top city
      </p>

      <div className="flex min-h-56 flex-col justify-center">
        <div>
          <p className="text-[40px] font-extrabold leading-none tracking-tight text-gray-900">
            {pct}%
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-700">
            in {data.topCity || "—"}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {Number(data.propertyCount ?? 0).toLocaleString("en-IN")} of{" "}
            {totalProperties.toLocaleString("en-IN")} properties
          </p>
        </div>

        <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#22C55E] transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 min-h-5">
          {pct >= 70 ? (
            <p className="text-xs font-semibold text-amber-700">
              Consider diversifying
            </p>
          ) : pct < 40 ? (
            <p className="text-xs font-semibold text-[#16a34a]">
              Well diversified
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ── Main component ──────────────────────────────────────────────

export default function AnalyticsPanel({ refreshKey }) {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const analytics = await getDashboardAnalytics();

      setData(analytics);
    } catch {
      setData({
        avgValueByType: [],
        pricePerSqftByCity: [],
        verificationRateByCity: [],
        portfolioConcentration: null,
      });
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (expanded && !hasLoaded) {
      load();
    }
  }, [expanded, hasLoaded, load]);

  useEffect(() => {
    if (hasLoaded) {
      load();
    }
  }, [refreshKey, hasLoaded, load]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className={`flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50/60 ${
          expanded ? "border-b border-gray-100" : ""
        }`}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf7f3]">
            <BarChart3
              className="h-4 w-4 text-[#16a34a]"
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Advanced analytics
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Deeper portfolio performance insights
            </p>
          </div>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400">
          {expanded ? (
            <ChevronUp size={16} strokeWidth={2.5} />
          ) : (
            <ChevronDown size={16} strokeWidth={2.5} />
          )}
        </div>
      </button>

      {/* Collapsible body */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {loading ? (
            <AnalyticsSkeleton />
          ) : hasLoaded ? (
            <div className="grid min-w-0 grid-cols-1 gap-4 bg-gray-50/30 p-4 sm:gap-6 sm:p-6 lg:grid-cols-2">
              <AverageValueChart data={data?.avgValueByType ?? []} />

              <PricePerSqftChart
                data={data?.pricePerSqftByCity ?? []}
              />

              <VerificationRateChart
                data={data?.verificationRateByCity ?? []}
              />

              <PortfolioConcentration
                data={data?.portfolioConcentration ?? null}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}