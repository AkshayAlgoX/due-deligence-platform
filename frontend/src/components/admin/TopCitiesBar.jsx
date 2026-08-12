"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function TopCitiesBar({
  data,
  isDark,
  gridStroke,
  axisTickFill,
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={gridStroke}
          vertical={false}
        />

        <XAxis
          dataKey="city"
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
          cursor={{
            fill: isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.04)",
          }}
        />

        <Bar
          dataKey="count"
          fill="#22C55E"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}