"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  UserCheck,
  FileText,
  Server,
} from "lucide-react";
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
import StatsCard from "@/components/dashboard/StatsCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import {
  getAdminDashboardStats,
  getRiskDistribution,
  getReportsTrend,
  getTopCities,
  getActiveUsers,
  getSystemHealth,
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
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

function ChartCardShell({ title, subtitle, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">{title}</h3>
      {subtitle && (
        <p className="mt-0.5 mb-4 text-xs text-gray-400 dark:text-[#7d8590]">{subtitle}</p>
      )}
      {children}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const isDark = useDarkMode();

  const gridStroke = isDark ? "#30363d" : "#f3f4f6";
  const axisTickFill = isDark ? "#7d8590" : "#9ca3af";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [systemHealth, setSystemHealth] = useState("Unknown");
  const [riskData, setRiskData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [topCities, setTopCities] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, r, t, c, a, h] = await Promise.all([
          getAdminDashboardStats("30d"),
          getRiskDistribution("30d"),
          getReportsTrend("30d", "daily"),
          getTopCities(10),
          getActiveUsers(),
          getSystemHealth(),
        ]);
        setStats(s);
        setRiskData(r.map((d) => ({ name: d.level, value: d.count, color: RISK_COLORS[d.level] ?? "#9CA3AF" })));
        setTrendData(t.map((d) => ({ label: d.date, reports: d.count })));
        setTopCities(c.map((d) => ({ city: d.city, count: d.count })));
        setActiveUsers(a);
        setSystemHealth(h.dbStatus === "UP" && h.apiStatus === "UP" ? "Operational" : "Degraded");
      } catch {
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">
          {t("nav.admin.dashboard")}
        </h1>
        <p className="mt-1 text-sm text-gray-400 dark:text-[#7d8590]">
          Platform-wide stats and activity overview
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={(stats?.totalUsers ?? 0).toLocaleString()}
            icon={<Users size={20} />}
          />
          <StatsCard
            title="Active Users"
            value={activeUsers.toLocaleString()}
            icon={<UserCheck size={20} />}
          />
          <StatsCard
            title="Reports Generated"
            value={(stats?.reportsThisMonth ?? 0).toLocaleString()}
            icon={<FileText size={20} />}
          />
          <StatsCard
            title="System Health"
            value={systemHealth}
            icon={<Server size={20} />}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCardShell title="Reports Trend" subtitle="Last 30 days">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="reportsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={isDark ? 0.35 : 0.25} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: axisTickFill }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisTickFill }} axisLine={false} tickLine={false} width={32} />
              <Tooltip />
              <Area type="monotone" dataKey="reports" stroke="#22C55E" strokeWidth={2.5} fill="url(#reportsGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCardShell>

        <ChartCardShell title="Risk Distribution" subtitle="Across all properties">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={riskData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
              >
                {riskData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCardShell>

        <ChartCardShell title="Top Cities" subtitle="By property count">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topCities} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="city" tick={{ fontSize: 11, fill: axisTickFill }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisTickFill }} axisLine={false} tickLine={false} width={32} />
              <Tooltip />
              <Bar dataKey="count" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCardShell>

        <ChartCardShell title="Reports Trend (secondary view)" subtitle="Same data, bar form">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: axisTickFill }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisTickFill }} axisLine={false} tickLine={false} width={32} />
              <Tooltip />
              <Bar dataKey="reports" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCardShell>
      </div>
    </div>
  );
}