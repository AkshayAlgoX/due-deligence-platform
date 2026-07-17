"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  FileText,
  Activity,
  AlertCircle,
  Calendar,
  Plus,
  RefreshCw,
} from "lucide-react";

import StatsCard from "@/components/dashboard/StatsCard";
import PropertyRiskChart from "@/components/dashboard/PropertyRiskChart";
import ReportStatusChart from "@/components/dashboard/ReportStatusChart";
import MarketTrendsChart from "@/components/dashboard/MarketTrendsChart";
import TasksTable from "@/components/dashboard/TasksTable";
import AddPropertyModal from "@/components/property/AddPropertyModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import { StatsCardSkeleton } from "@/components/ui/Skeleton";

import { getDashboardStats } from "@/services/dashboardService";
import { getUser } from "@/utils/helpers";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
    loadStats();
  }, []);

  const loadStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const data = await getDashboardStats();
      setStats(data);

      if (silent) toast.success("Dashboard refreshed");
    } catch (err) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8">

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[32px] font-extrabold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Portfolio overview and real-time risk surveillance
            {user?.email && (
              <> for <span className="font-semibold text-gray-700">{user.email}</span></>
            )}
            .
          </p>
        </div>

        <div className="flex gap-3">
  {/* Premium Refresh button */}
  <button
    onClick={() => loadStats(true)}
    disabled={refreshing}
    className="group flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white transition-all hover:border-[#22C55E] hover:shadow-[0_4px_12px_rgba(34,197,94,0.2)] disabled:opacity-50"
    title="Refresh stats"
  >
    <RefreshCw
      size={16}
      className={`text-gray-600 group-hover:text-[#22C55E] transition-colors ${
        refreshing ? "animate-spin text-[#22C55E]" : ""
      }`}
    />
  </button>

  {/* Premium Date button */}
  <button className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:shadow-sm">
    <Calendar size={16} className="text-gray-500" />
    <span>{today}</span>
  </button>

  {/* Premium Add Property button — SUPER PREMIUM */}
  <button
    onClick={() => setModalOpen(true)}
    className="group relative flex h-11 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all hover:shadow-[0_15px_40px_rgba(34,197,94,0.55)] hover:scale-[1.03] active:scale-[0.97]"
  >
    {/* Shimmer effect */}
    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

    <Plus size={18} className="relative z-10" strokeWidth={2.5} />
    <span className="relative z-10">Add Property</span>
  </button>
</div>
      </div>

      {/* KPI Cards — skeletons while loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Properties"
            value={stats.totalProperties.toLocaleString()}
            icon={<Building2 size={20} strokeWidth={2.5} />}
            trendValue={`${stats.trends.propertiesGrowth}%`}
            trendUp={stats.trends.propertiesGrowth > 0}
          />
          <StatsCard
            title="Reports Generated"
            value={stats.reportsGenerated.toLocaleString()}
            icon={<FileText size={20} strokeWidth={2.5} />}
            trendValue={`${stats.trends.reportsGrowth}%`}
            trendUp={stats.trends.reportsGrowth > 0}
          />
          <StatsCard
            title="Avg Risk Score"
            value={`${stats.avgRiskScore}/100`}
            icon={<Activity size={20} strokeWidth={2.5} />}
            trendValue={`${Math.abs(stats.trends.riskChange)}%`}
            trendUp={stats.trends.riskChange > 0}
          />
          <StatsCard
            title="Active Alerts"
            value={stats.activeAlerts}
            icon={<AlertCircle size={20} strokeWidth={2.5} />}
            trendValue={`${stats.trends.alertsChange}`}
            trendUp={stats.trends.alertsChange > 0}
          />
        </div>
      )}

      {/* Charts wrapped in ErrorBoundary */}
      <ErrorBoundary>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PropertyRiskChart />
          </div>
          <div className="lg:col-span-1">
            <ReportStatusChart />
          </div>
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <MarketTrendsChart />
      </ErrorBoundary>

      <ErrorBoundary>
        <TasksTable />
      </ErrorBoundary>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => loadStats(true)}
      />
    </div>
  );
}