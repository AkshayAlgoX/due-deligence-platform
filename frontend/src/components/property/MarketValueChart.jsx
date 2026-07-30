"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import i18n from "@/i18n";

// ── Generate 6 months of mock trend data ─────────────────────────────────────
// Month labels are computed at render time so they use the current locale.
function generateMockData(properties, lang) {
  const now = new Date();
  // Build last 6 months: [-5, -4, -3, -2, -1, 0] months from now
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toLocaleDateString(lang || "en-IN", { month: "short" });
  });

  return months.map((month, i) => {
    const point = { month };
    properties.forEach((p, idx) => {
      if (!p?.marketValue) return;
      const trend = 1 + (i - 2) * 0.018;
      const noise = 1 + (Math.sin(idx * 3 + i) * 0.025);
      point[`prop_${idx}`] = Math.round(p.marketValue * trend * noise);
    });
    return point;
  });
}

const LINE_COLORS = ["#22C55E", "#3B82F6", "#A855F7"];

function formatYAxis(value) {
  // Cr / L are region-specific units, kept as-is across languages.
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`;
  return `₹${value.toLocaleString(i18n.language || "en-IN")}`;
}

// ── Custom tooltip — uses isDark prop for inline styles ───────────────────────
function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        backgroundColor: isDark ? "#1c2128" : "#ffffff",
        border: `1px solid ${isDark ? "#30363d" : "#f3f4f6"}`,
        borderRadius: "12px",
        padding: "12px",
        boxShadow: isDark
          ? "0 8px 24px rgba(0,0,0,0.4)"
          : "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: isDark ? "#6e7681" : "#9ca3af",
          marginBottom: "8px",
        }}
      >
        {label}
      </p>
      {payload.map((entry, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: i < payload.length - 1 ? "4px" : 0,
          }}
        >
          <span
            style={{
              height: "8px",
              width: "8px",
              borderRadius: "50%",
              backgroundColor: entry.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: isDark ? "#7d8590" : "#4b5563",
            }}
          >
            {entry.name}:
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 900,
              color: isDark ? "#e6edf3" : "#111827",
            }}
          >
            {formatYAxis(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MarketValueChart({ properties = [] }) {
  const { t, i18n: i18nInst } = useTranslation();
  const [isDark, setIsDark] = useState(false);

  // MutationObserver — same pattern as PortfolioTrendChart
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

  const validProperties = properties.filter(Boolean);

  // Labels — "Property A", "Property B", "Property C" — computed via t()
  // Letters A/B/C stay Latin (universal legend indexing convention)
  const LABELS = useMemo(
    () => [
      t("marketChart.propertyLabel", { letter: "A" }),
      t("marketChart.propertyLabel", { letter: "B" }),
      t("marketChart.propertyLabel", { letter: "C" }),
    ],
    [t]
  );

  // Re-generate mock data when language changes so month names update
  const data = useMemo(
    () => generateMockData(validProperties, i18nInst.language),
    [validProperties, i18nInst.language]
  );

  if (validProperties.length < 2) return null;

  // Dark-aware recharts colors
  const gridStroke = isDark ? "#30363d" : "#f1f5f9";
  const axisTickFill = isDark ? "#7d8590" : "#94a3b8";

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 dark:bg-[#0d2818] ring-1 ring-green-200 dark:ring-green-900/50">
            <TrendingUp className="h-4 w-4 text-[#16a34a]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-[#e6edf3]">
              {t("marketChart.title")}
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-[#6e7681] font-medium">
              {t("marketChart.subtitle")}
            </p>
          </div>
        </div>

        {/* Mock data disclaimer pill */}
        <span className="rounded-full bg-amber-50 dark:bg-[#282a10] px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-900/50">
          {t("marketChart.estimatedBadge")}
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridStroke}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fontWeight: 700, fill: axisTickFill }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 10, fontWeight: 700, fill: axisTickFill }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          <Legend
            formatter={(value) => (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: isDark ? "#7d8590" : "#4b5563",
                }}
              >
                {value}
              </span>
            )}
          />
          {validProperties.map((_, idx) => (
            <Line
              key={idx}
              type="monotone"
              dataKey={`prop_${idx}`}
              name={LABELS[idx]}
              stroke={LINE_COLORS[idx]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: LINE_COLORS[idx], strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}