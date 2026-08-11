"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

export default function RiskDistributionPie({ data, isDark }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#161b22" : "#ffffff",
            border: `1px solid ${isDark ? "#30363d" : "#e5e7eb"}`,
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: isDark ? "#e6edf3" : "#111827" }}
          cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}