"use client";
import useAdminDashboard from "@/hooks/useAdminDashboard";
import TopCitiesBar from "@/components/admin/TopCitiesBar";
import RiskDistributionPie from "@/components/admin/RiskDistributionPie";
import ReportsLineChart from "@/components/admin/ReportsLineChart";
import KpiGrid from "@/components/admin/KpiGrid";
import ExportAnalyticsButton from "@/components/admin/ExportAnalyticsButton";
import UserActivityHeatmap from "@/components/admin/UserActivityHeatmap";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, TrendingUp } from "lucide-react";

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

function ChartCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="group relative rounded-2xl border border-gray-200/70 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 transition-all duration-200 hover:border-gray-300 dark:hover:border-[#484f58] hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-black/20">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className="h-4 w-4 text-gray-400 dark:text-[#7d8590]" />
            )}
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-[#e6edf3] tracking-tight">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="mt-1 text-[13px] text-gray-500 dark:text-[#7d8590] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
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
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-6 py-8 space-y-8">
        {/* Page Header */}
        <header className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-500/20">
              <LayoutDashboard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-[28px] leading-tight font-bold tracking-tight text-gray-900 dark:text-[#e6edf3]">
                {t("nav.admin.dashboard")}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">
                {t("nav.admin.dashboardSubtitle")}
              </p>
            </div>
          </div>
          <ExportAnalyticsButton />
        </header>

        {/* KPI Grid */}
        <KpiGrid
          loading={loading}
          totalUsers={stats?.totalUsers}
          reportsThisMonth={stats?.reportsThisMonth}
          systemHealth={systemHealth}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartCard
            title={t("nav.admin.reportsTrend")}
            subtitle={t("nav.admin.reportsTrendSubtitle")}
            icon={TrendingUp}
          >
            <ReportsLineChart
              data={trendData}
              isDark={isDark}
              gridStroke={gridStroke}
              axisTickFill={axisTickFill}
            />
          </ChartCard>

          <ChartCard
            title={t("nav.admin.riskDistribution")}
            subtitle={t("nav.admin.riskDistributionSubtitle")}
          >
            <RiskDistributionPie data={riskData} isDark={isDark} />
          </ChartCard>

          <ChartCard
            title={t("nav.admin.topCities")}
            subtitle={t("nav.admin.topCitiesSubtitle")}
          >
            <TopCitiesBar
              data={topCities}
              isDark={isDark}
              gridStroke={gridStroke}
              axisTickFill={axisTickFill}
            />
          </ChartCard>

          <ChartCard
            title={t("nav.admin.userActivity")}
            subtitle={t("nav.admin.userActivitySubtitle")}
          >
            <UserActivityHeatmap data={heatmapData} isDark={isDark} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}