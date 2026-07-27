"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  ShieldCheck,
  Clock,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

import StatsCard from "@/components/dashboard/StatsCard";
import RecentPropertiesTable from "@/components/dashboard/RecentPropertiesTable";
import HeroStrip from "@/components/dashboard/HeroStrip";
import PortfolioBreakdown from "@/components/dashboard/PortfolioBreakdown";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import AddPropertyModal from "@/components/property/AddPropertyModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import { StatsCardSkeleton } from "@/components/ui/Skeleton";

import {
  getDashboardStats,
  getDashboardTrends,
} from "@/services/dashboardService";
import { getCurrentUser } from "@/services/authService";
import PortfolioTrendChart from "@/components/dashboard/PortfolioTrendChart";
import RecommendationsPanel from "@/components/dashboard/RecommendationsPanel";
import PortfolioMap from "@/components/dashboard/PortfolioMap";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadUser();
    loadAll();
  }, []);

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch {
      // Silent — dashboard still works without user context
    }
  };

  const loadAll = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const [statsData, trendsData] = await Promise.all([
        getDashboardStats(),
        getDashboardTrends().catch(() => null),
      ]);
      setStats(statsData);
      setTrends(trendsData);

      if (silent) toast.success("Dashboard updated", { duration: 1500 });
    } catch (err) {
      toast.error("Couldn't load dashboard", {
        description: "Please refresh the page or try again.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1); // triggers child refetches
    loadAll(true);
  };

  const handleAddSuccess = () => {
    setRefreshKey((k) => k + 1);
    loadAll(true);
  };

  const firstName =
    user?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";
  const isAdmin = user?.role === "ADMIN";
  const subtitle = isAdmin ? "Platform overview" : "Your portfolio at a glance";

  const isEmpty = stats && stats.totalProperties === 0;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-gray-900">
            {getGreeting()}
            {firstName ? (
              <span className="text-[#22C55E]">, {firstName}</span>
            ) : (
              ""
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="group flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white transition-all hover:border-[#22C55E] hover:shadow-[0_4px_12px_rgba(34,197,94,0.2)] disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw
              size={16}
              className={`text-gray-600 transition-colors group-hover:text-[#22C55E] ${
                refreshing ? "animate-spin text-[#22C55E]" : ""
              }`}
            />
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="group relative flex h-11 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_15px_40px_rgba(34,197,94,0.55)] active:scale-[0.97]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            <Plus size={18} className="relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">Add property</span>
          </button>
        </div>
      </div>

      {/* ── Hero Strip (only when properties exist) ─────────────── */}
{!isEmpty && (
  <ErrorBoundary>
    <HeroStrip stats={stats} loading={loading} key={`hero-${refreshKey}`} />
  </ErrorBoundary>
)}

{/* ── Portfolio trend chart ───────────────────────────────── */}
{!isEmpty && (
  <ErrorBoundary>
    <PortfolioTrendChart key={`trend-${refreshKey}`} refreshKey={refreshKey} />
  </ErrorBoundary>
)}

{/* ── Recommendations ─────────────────────────────────────── */}
{!isEmpty && (
  <ErrorBoundary>
    <RecommendationsPanel key={`rec-${refreshKey}`} refreshKey={refreshKey} />
  </ErrorBoundary>
)}

{/* ── Portfolio map ───────────────────────────────────────── */}
{!isEmpty && (
  <ErrorBoundary>
    <PortfolioMap key={`map-${refreshKey}`} refreshKey={refreshKey} />
  </ErrorBoundary>
)}

{/* ── KPI Cards ───────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : !stats ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
          Unable to load statistics. Please refresh the page.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total properties"
            value={
              stats.totalProperties > 0
                ? stats.totalProperties.toLocaleString()
                : "—"
            }
            subtitle={
              stats.totalProperties === 0
                ? "No properties added"
                : formatTrend(trends?.propertiesThisWeek, "this week")
            }
            icon={<Building2 size={20} strokeWidth={2.5} />}
            trendValue={formatDelta(trends?.propertiesGrowthPct)}
            trendUp={trends ? trends.propertiesGrowthPct >= 0 : null}
             href="/dashboard/property-search"
          />

          <StatsCard
            title="Verified"
            value={
              stats.verifiedProperties > 0
                ? stats.verifiedProperties.toLocaleString()
                : "—"
            }
            subtitle={
              stats.totalProperties > 0
                ? `${Math.round(
                    (stats.verifiedProperties / stats.totalProperties) * 100
                  )}% of total`
                : "Nothing to verify yet"
            }
            icon={<ShieldCheck size={20} strokeWidth={2.5} />}
            trendValue={formatDelta(trends?.verifiedGrowthPct)}
            trendUp={trends ? trends.verifiedGrowthPct >= 0 : null}
             href="/dashboard/property-search?filter=verified"
          />

          <StatsCard
            title="Pending"
            value={
              stats.pendingProperties > 0
                ? stats.pendingProperties.toLocaleString()
                : "—"
            }
            subtitle={
              stats.pendingProperties > 0
                ? "Awaiting verification"
                : "All caught up"
            }
            icon={<Clock size={20} strokeWidth={2.5} />}
            trendValue={null}
            href={
    stats.pendingProperties > 0
      ? "/dashboard/property-search?filter=pending"
      : undefined
  }
          />

          <StatsCard
            title="Platform users"
            value={
              stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : "—"
            }
            subtitle={
              stats.activeUsers > 0
                ? `${stats.activeUsers} active in 30 days`
                : undefined
            }
            icon={<Users size={20} strokeWidth={2.5} />}
            trendValue={formatDelta(trends?.usersGrowthPct)}
            trendUp={trends ? trends.usersGrowthPct >= 0 : null}
          />
        </div>
      )}

      {/* ── Portfolio breakdown + Recent properties (2-col) ────── */}
      {!loading && !isEmpty && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ErrorBoundary>
              <RecentPropertiesTable />
            </ErrorBoundary>
          </div>
          <div className="lg:col-span-2">
            <ErrorBoundary>
              <PortfolioBreakdown key={`chart-${refreshKey}`} />
            </ErrorBoundary>
          </div>
        </div>
      )}

      {/* ── Activity feed ──────────────────────────────────────── */}
      {!loading && !isEmpty && (
        <ErrorBoundary>
          <ActivityFeed key={`activity-${refreshKey}`} />
        </ErrorBoundary>
      )}

      {/* ── Advanced analytics (collapsible) ────────────────────── */}
      {!loading && !isEmpty && (
        <ErrorBoundary>
          <AnalyticsPanel
            key={`analytics-${refreshKey}`}
            refreshKey={refreshKey}
          />
        </ErrorBoundary>
      )}

      {/* ── Empty state ────────────────────────────────────────── */}
      {!loading && isEmpty && <EmptyState onAddClick={() => setModalOpen(true)} />}

      <AddPropertyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────
function EmptyState({ onAddClick }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-10 shadow-sm">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf7f3]">
          <Building2 className="h-7 w-7 text-[#16a34a]" strokeWidth={2} />
        </div>

        <h2 className="mt-5 text-lg font-bold text-gray-900">
          No properties yet
        </h2>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          Add your first property to see verification results and portfolio insights.
        </p>

        <button
          type="button"
          onClick={onAddClick}
          className="mt-6 flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#22C55E] to-[#16a34a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] transition-all duration-150 hover:opacity-95 active:scale-95"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add your first property
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDelta(pct) {
  if (pct == null || pct === 0) return null;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

function formatTrend(count, suffix) {
  if (count == null || count === 0) return undefined;
  return `+${count} ${suffix}`;
}