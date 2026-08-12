"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function RiskDistributionPie({ data = [], isDark }) {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            stroke="none"
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
              padding: "8px 12px",
            }}
            labelStyle={{ color: isDark ? "#e6edf3" : "#111827" }}
            formatter={(value, name) => [`${value} properties`, name]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend below chart */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 px-2">
        {data.map((entry, i) => {
          const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[13px] font-medium text-gray-700 dark:text-[#e6edf3]">
                {entry.name}
              </span>
              <span className="text-[12px] text-gray-500 dark:text-[#7d8590]">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}