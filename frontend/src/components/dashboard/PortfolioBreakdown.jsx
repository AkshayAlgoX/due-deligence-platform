"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieIcon, Building2 } from "lucide-react";
import { getPortfolioInsights } from "@/services/dashboardService";
import { formatINR } from "@/utils/currency";

/**
 * PortfolioBreakdown — pie chart showing property distribution by type.
 *
 * Real data from /api/dashboard/insights. No dummy segments.
 */

const COLORS = [
  "#22C55E", // primary green
  "#0ea5e9", // sky
  "#a855f7", // purple
  "#f59e0b", // amber
  "#ef4444", // red
  "#64748b", // slate
];

export default function PortfolioBreakdown() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getPortfolioInsights();
        if (mounted) setInsights(data);
      } catch {
        if (mounted) setInsights(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const chartData =
    insights?.distributionByType?.map((d) => ({
      name: d.propertyType,
      value: d.count,
      totalValue: d.totalValue,
    })) ?? [];

  const hasData = chartData.length > 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf7f3]">
            <PieIcon className="h-4 w-4 text-[#16a34a]" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Portfolio breakdown</h3>
            <p className="text-xs text-gray-500 mt-0.5">By property type</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-40 w-40 animate-pulse rounded-full bg-gray-100" />
          </div>
        ) : !hasData ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
              <Building2 className="h-5 w-5 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No data yet</p>
            <p className="mt-1 text-xs text-gray-500">
              Add properties to see breakdown
            </p>
          </div>
        ) : (
          <>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom legend below chart */}
            <div className="mt-4 space-y-2">
              {chartData.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="font-semibold text-gray-700 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="tabular-nums font-bold text-gray-900">
                      {item.value}
                    </span>
                    {item.totalValue > 0 && (
                      <span className="text-gray-400 tabular-nums">
                        · {formatINR(item.totalValue)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Custom tooltip ────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg">
      <p className="text-xs font-bold text-gray-900">{item.name}</p>
      <p className="mt-1 text-[11px] text-gray-500">
        <span className="font-semibold text-gray-700 tabular-nums">
          {item.value}
        </span>{" "}
        {item.value === 1 ? "property" : "properties"}
      </p>
      {item.totalValue > 0 && (
        <p className="text-[11px] text-gray-500">
          Value:{" "}
          <span className="font-semibold text-gray-700 tabular-nums">
            {formatINR(item.totalValue)}
          </span>
        </p>
      )}
    </div>
  );
}