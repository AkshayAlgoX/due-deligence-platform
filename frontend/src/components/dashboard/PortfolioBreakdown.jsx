"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PieChart as PieIcon, Building2 } from "lucide-react";
import { getPortfolioInsights } from "@/services/dashboardService";
import { formatINR } from "@/utils/currency";

const COLORS = [
  "#22C55E",
  "#0ea5e9",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#64748b",
];

export default function PortfolioBreakdown() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode for pie cell stroke color (recharts needs concrete value)
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
  const cellStroke = isDark ? "#161b22" : "#ffffff";

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#30363d] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818]">
            <PieIcon className="h-4 w-4 text-[#16a34a] dark:text-green-400" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">Portfolio breakdown</h3>
            <p className="text-xs text-gray-500 dark:text-[#7d8590] mt-0.5">By property type</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-40 w-40 animate-pulse rounded-full bg-gray-100 dark:bg-[#1c2128]" />
          </div>
        ) : !hasData ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-[#1c2128]">
              <Building2 className="h-5 w-5 text-gray-300 dark:text-[#6e7681]" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-[#e6edf3]">No data yet</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590]">
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
                        stroke={cellStroke}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

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
                    <span className="font-semibold text-gray-700 dark:text-[#e6edf3] truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="tabular-nums font-bold text-gray-900 dark:text-[#e6edf3]">
                      {item.value}
                    </span>
                    {item.totalValue > 0 && (
                      <span className="text-gray-400 dark:text-[#6e7681] tabular-nums">
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

function CustomTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div
      className="rounded-lg border p-3 shadow-lg"
      style={{
        background: isDark ? "#1c2128" : "#ffffff",
        borderColor: isDark ? "#30363d" : "#f3f4f6",
        color: isDark ? "#e6edf3" : "#111827",
      }}
    >
      <p className="text-xs font-bold" style={{ color: isDark ? "#e6edf3" : "#111827" }}>
        {item.name}
      </p>
      <p className="mt-1 text-[11px]" style={{ color: isDark ? "#7d8590" : "#6b7280" }}>
        <span className="font-semibold tabular-nums" style={{ color: isDark ? "#e6edf3" : "#374151" }}>
          {item.value}
        </span>{" "}
        {item.value === 1 ? "property" : "properties"}
      </p>
      {item.totalValue > 0 && (
        <p className="text-[11px]" style={{ color: isDark ? "#7d8590" : "#6b7280" }}>
          Value:{" "}
          <span className="font-semibold tabular-nums" style={{ color: isDark ? "#e6edf3" : "#374151" }}>
            {formatINR(item.totalValue)}
          </span>
        </p>
      )}
    </div>
  );
}