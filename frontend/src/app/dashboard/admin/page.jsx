"use client";
import useAdminDashboard from "@/hooks/useAdminDashboard";
import TopCitiesBar from "@/components/admin/TopCitiesBar";
import RiskDistributionPie from "@/components/admin/RiskDistributionPie";
import ReportsLineChart from "@/components/admin/ReportsLineChart";
import KpiGrid from "@/components/admin/KpiGrid";
import ActiveUsersCounter from "@/components/admin/ActiveUsersCounter";
import ExportAnalyticsButton from "@/components/admin/ExportAnalyticsButton";
import UserActivityHeatmap from "@/components/admin/UserActivityHeatmap";
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
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-[#e6edf3]">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-1 text-sm text-gray-400 dark:text-[#7d8590]">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const isDark = useDarkMode();

  const gridStroke = isDark ? "#30363d" : "#f3f4f6";
  const axisTickFill = isDark ? "#7d8590" : "#9ca3af";

  const {
  loading,
  stats,
  systemHealth,
  riskData,
  trendData,
  topCities,
  heatmapData,
} = useAdminDashboard();


  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
  <div>
    <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">
      {t("nav.admin.dashboard")}
    </h1>
   <p className="mt-1 text-sm text-gray-400 dark:text-[#7d8590]">
  {t("nav.admin.dashboardSubtitle")}
</p>
  </div>
  <ExportAnalyticsButton />
</div>

      <KpiGrid
  loading={loading}
  totalUsers={stats?.totalUsers}
  reportsThisMonth={stats?.reportsThisMonth}
  systemHealth={systemHealth}
/>

     {/* Charts */}
<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

  <ChartCardShell
    title={t("nav.admin.reportsTrend")}
    subtitle={t("nav.admin.reportsTrendSubtitle")}
  >
    <ReportsLineChart
      data={trendData}
      isDark={isDark}
      gridStroke={gridStroke}
      axisTickFill={axisTickFill}
    />
  </ChartCardShell>

  <ChartCardShell
    title={t("nav.admin.riskDistribution")}
    subtitle={t("nav.admin.riskDistributionSubtitle")}
  >
    <RiskDistributionPie
      data={riskData}
      isDark={isDark}
    />
  </ChartCardShell>

  <ChartCardShell
    title={t("nav.admin.topCities")}
    subtitle={t("nav.admin.topCitiesSubtitle")}
  >
    <TopCitiesBar
      data={topCities}
      isDark={isDark}
      gridStroke={gridStroke}
      axisTickFill={axisTickFill}
    />
  </ChartCardShell>

  <ChartCardShell
    title={t("nav.admin.userActivity")}
    subtitle={t("nav.admin.userActivitySubtitle")}
  >
    <UserActivityHeatmap
      data={heatmapData}
      isDark={isDark}
    />
  </ChartCardShell>

</div>
    </div>
  );
}