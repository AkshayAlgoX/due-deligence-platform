"use client";

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

// ── Generate 6 months of mock trend data ────────────────────────────────────
function generateMockData(properties) {
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  return months.map((month, i) => {
    const point = { month };
    properties.forEach((p, idx) => {
      if (!p?.marketValue) return;
      // Simulate ±5% fluctuation over 6 months
      const trend = 1 + (i - 2) * 0.018;
      const noise = 1 + (Math.sin(idx * 3 + i) * 0.025);
      point[`prop_${idx}`] = Math.round(p.marketValue * trend * noise);
    });
    return point;
  });
}

const LINE_COLORS = ["#22C55E", "#3B82F6", "#A855F7"];
const LABELS = ["Property A", "Property B", "Property C"];

function formatYAxis(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-semibold text-gray-600">
            {entry.name}:
          </span>
          <span className="text-xs font-black text-gray-900">
            {formatYAxis(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MarketValueChart({ properties = [] }) {
  const validProperties = properties.filter(Boolean);

  if (validProperties.length < 2) return null;

  const data = generateMockData(validProperties);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 ring-1 ring-green-200">
            <TrendingUp className="h-4 w-4 text-[#16a34a]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900">
              Market value trend
            </h3>
            <p className="text-[11px] text-gray-400 font-medium">
              6-month estimated trend · indicative only
            </p>
          </div>
        </div>

        {/* Mock data disclaimer */}
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600 ring-1 ring-amber-100">
          Estimated data
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
            stroke="#f1f5f9"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-[11px] font-bold text-gray-600">
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