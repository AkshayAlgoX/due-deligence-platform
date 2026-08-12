"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useTranslation } from "react-i18next";

export default function ReportsLineChart({ data = [], isDark }) {
  const { t } = useTranslation();

  const gridStroke = isDark ? "#30363d" : "#f3f4f6";
  const axisTickFill = isDark ? "#7d8590" : "#9ca3af";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="reportsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="#22C55E"
              stopOpacity={isDark ? 0.35 : 0.25}
            />
            <stop
              offset="100%"
              stopColor="#22C55E"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        <CartesianGrid
          stroke={gridStroke}
          strokeDasharray="3 3"
          vertical={false}
        />

        <XAxis
          dataKey="label"
          tick={{
            fontSize: 11,
            fill: axisTickFill,
          }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{
            fontSize: 10,
            fill: axisTickFill,
          }}
          axisLine={false}
          tickLine={false}
          width={32}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#161b22" : "#ffffff",
            border: `1px solid ${
              isDark ? "#30363d" : "#e5e7eb"
            }`,
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{
            color: isDark ? "#e6edf3" : "#111827",
          }}
          formatter={(value) => [
            value,
            t("nav.admin.reportsGenerated"),
          ]}
          cursor={{
            fill: isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.04)",
          }}
        />

        <Area
          type="monotone"
          dataKey="count"
          stroke="#22C55E"
          strokeWidth={2}
          fill="url(#reportsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}