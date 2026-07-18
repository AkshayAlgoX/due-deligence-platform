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
  Users,
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

  // First name for personal greeting
  const firstName = user?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-[#22C55E] mb-1">
            Portfolio Overview
          </p>
          <h1 className="text-[32px] font-extrabold text-gray-900 tracking-tight">
            {getGreeting()},{" "}
            <span className="text-[#22C55E]">{firstName}</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Here&apos;s what&apos;s happening across your real estate portfolio today.
          </p>
        </div>

        <div className="flex gap-3">
          {/* Refresh */}
          <button
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className="
              group flex h-11 w-11 items-center justify-center
              rounded-xl border border-gray-200 bg-white
              transition-all
              hover:border-[#22C55E]
              hover:shadow-[0_4px_12px_rgba(34,197,94,0.2)]
              disabled:opacity-50
            "
            title="Refresh stats"
          >
            <RefreshCw
              size={16}
              className={`text-gray-600 group-hover:text-[#22C55E] transition-colors ${
                refreshing ? "animate-spin text-[#22C55E]" : ""
              }`}
            />
          </button>

          {/* Date */}
          <button className="
            flex h-11 items-center gap-2
            rounded-xl border border-gray-200 bg-white
            px-4 text-sm font-semibold text-gray-700
            transition-all hover:border-gray-300 hover:shadow-sm
          ">
            <Calendar size={16} className="text-gray-500" />
            <span>{today}</span>
          </button>

          {/* Add Property */}
          <button
            onClick={() => setModalOpen(true)}
            className="
              group relative flex h-11 items-center gap-2
              overflow-hidden
              rounded-xl
              bg-gradient-to-br from-[#22C55E] to-[#16a34a]
              px-5 text-sm font-bold text-white
              shadow-[0_10px_30px_rgba(34,197,94,0.4)]
              transition-all
              hover:shadow-[0_15px_40px_rgba(34,197,94,0.55)]
              hover:scale-[1.03]
              active:scale-[0.97]
            "
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            <Plus size={18} className="relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">Add Property</span>
          </button>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Total Properties — real DB count */}
          <StatsCard
            title="Total Properties"
            value={
              stats.totalProperties > 0
                ? stats.totalProperties.toLocaleString()
                : "—"
            }
            subtitle={
              stats.totalProperties === 0
                ? "Add your first property to get started"
                : undefined
            }
            icon={<Building2 size={20} strokeWidth={2.5} />}
            trendValue={
              stats.trends.propertiesGrowth !== 0
                ? `${stats.trends.propertiesGrowth}%`
                : null
            }
            trendUp={stats.trends.propertiesGrowth > 0}
          />

          {/* Platform Users — real DB count */}
          <StatsCard
            title="Platform Users"
            value={
              (stats.totalUsers ?? 0) > 0
                ? (stats.totalUsers ?? 0).toLocaleString()
                : "—"
            }
            subtitle={
              (stats.totalUsers ?? 0) === 0
                ? "No users registered yet"
                : undefined
            }
            icon={<Users size={20} strokeWidth={2.5} />}
            trendValue={null}
            trendUp={false}
          />

          {/* Reports Generated — honest zero */}
          <StatsCard
            title="Reports Generated"
            value={
              stats.reportsGenerated > 0
                ? stats.reportsGenerated.toLocaleString()
                : "—"
            }
            subtitle={
              stats.reportsGenerated === 0
                ? "Reports feature coming soon"
                : undefined
            }
            icon={<FileText size={20} strokeWidth={2.5} />}
            trendValue={
              stats.trends.reportsGrowth !== 0
                ? `${stats.trends.reportsGrowth}%`
                : null
            }
            trendUp={stats.trends.reportsGrowth > 0}
          />

          {/* Active Alerts — honest zero */}
          <StatsCard
            title="Active Alerts"
            value={
              stats.activeAlerts > 0
                ? stats.activeAlerts.toString()
                : "—"
            }
            subtitle={
              stats.activeAlerts === 0
                ? "No alerts at the moment"
                : undefined
            }
            icon={<AlertCircle size={20} strokeWidth={2.5} />}
            trendValue={
              stats.trends.alertsChange !== 0
                ? `${stats.trends.alertsChange}`
                : null
            }
            trendUp={stats.trends.alertsChange > 0}
          />
        </div>
      )}

      {/* ── Charts ───────────────────────────────────────────────────────── */}
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

      {/* ── Add Property Modal ───────────────────────────────────────────── */}
      <AddPropertyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => loadStats(true)}
      />
    </div>
  );
}

// ── Tiny helper — time-of-day greeting ───────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
