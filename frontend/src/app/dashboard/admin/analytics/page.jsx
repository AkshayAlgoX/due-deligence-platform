"use client";
import { useTranslation } from "react-i18next";
import DateRangePicker from "@/components/admin/DateRangePicker";
import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";
import {
  getRiskDistribution,
  getReportsTrend,
  getTopCities,
} from "@/services/adminService";

const RISK_COLORS = {
  LOW: "#22C55E",
  MEDIUM: "#F59E0B",
  MED: "#F59E0B",
  HIGH: "#EF4444",
  CRITICAL: "#991B1B",
};

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
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
  return isDark;
}

function ChartCardShell({ title, subtitle, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-0.5 mb-4 text-xs text-gray-400 dark:text-[#7d8590]">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { t } = useTranslation();
  const isDark = useDarkMode();
  const gridStroke = isDark ? "#30363d" : "#f3f4f6";
  const axisTickFill = isDark ? "#7d8590" : "#9ca3af";

  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [topCities, setTopCities] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r, tr, c] = await Promise.all([
        getRiskDistribution(period),
        getReportsTrend(period, "daily"),
        getTopCities(10),
      ]);
      setRiskData(
        r.map((d) => ({
          name: d.level,
          value: d.count,
          color: RISK_COLORS[d.level] ?? "#9CA3AF",
        }))
      );
      setTrendData(tr.map((d) => ({ label: d.date, reports: d.count })));
      setTopCities(c.map((d) => ({ city: d.city, count: d.count })));
    } catch {
      toast.error(t("nav.admin.activeUsersFailed"));
    } finally {
      setLoading(false);
    }
  }, [period, t]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: isDark ? "#161b22" : "#ffffff",
      border: `1px solid ${isDark ? "#30363d" : "#e5e7eb"}`,
      borderRadius: 8,
      fontSize: 12,
    },
    labelStyle: { color: isDark ? "#e6edf3" : "#111827" },
    cursor: {
      fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    },
  };

    return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-6 py-8 space-y-8">
        <header className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 border border-emerald-500/20">
              <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-[28px] leading-tight font-bold tracking-tight text-gray-900 dark:text-[#e6edf3]">
                {t("nav.admin.analytics")}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">
                {t("nav.admin.analyticsSubtitle")}
              </p>
            </div>
          </div>
          <DateRangePicker value={period} onChange={setPeriod} />
        </header>
        

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCardShell
            title={t("nav.admin.reportsTrend")}
            subtitle={`${t("nav.admin.reportsTrendSubtitle")} — ${period}`}
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={trendData}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="analyticsReportsGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#22C55E"
                      stopOpacity={isDark ? 0.35 : 0.25}
                    />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: axisTickFill }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: axisTickFill }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip {...tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="reports"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  fill="url(#analyticsReportsGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCardShell>

                    <ChartCardShell
            title={t("nav.admin.riskDistribution")}
            subtitle={t("nav.admin.riskDistributionSubtitle")}
          >
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {riskData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value, name) => [`${value} properties`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap justify-center gap-4 px-2">
                {riskData.map((entry, i) => {
                  const total = riskData.reduce((s, r) => s + (r.value || 0), 0);
                  const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
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
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </ChartCardShell>
          <ChartCardShell
            title={t("nav.admin.topCities")}
            subtitle={t("nav.admin.topCitiesSubtitle")}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={topCities}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="city"
                  tick={{ fontSize: 11, fill: axisTickFill }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: axisTickFill }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#22C55E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCardShell>
                </div>
      )}
      </div>
    </div>
  );
}