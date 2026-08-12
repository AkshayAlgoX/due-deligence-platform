"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Building2,
  ShieldCheck,
  Clock,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import { fadeInUp } from "@/utils/animations";

import StatsCard from "@/components/dashboard/StatsCard";
import RecentPropertiesTable from "@/components/dashboard/RecentPropertiesTable";
import HeroStrip from "@/components/dashboard/HeroStrip";
import PortfolioBreakdown from "@/components/dashboard/PortfolioBreakdown";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import AddPropertyModal from "@/components/property/AddPropertyModal";
import { getUser } from "@/utils/helpers";
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

export default function DashboardPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── ADMIN AUTO-REDIRECT (sync role read to prevent flash) ────────
  const [userRole] = useState(() => {
    if (typeof window === "undefined") return "";
    try { const u = getUser(); return u?.role ?? ""; } catch { return ""; }
  });

  useEffect(() => {
    if (userRole === "ADMIN") { router.replace("/dashboard/admin"); }
  }, [userRole, router]);

  // ── Unauthorized redirect toast ──────────────────────────────────
  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      toast.error(t("dashboard.errors.unauthorized"));
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams, t]);

  // ── Page title ───────────────────────────────────────────────────
  useEffect(() => {
    document.title = t("dashboard.pageTitle");
  }, [t]);

  // ── Initial data load ────────────────────────────────────────────
  useEffect(() => {
    loadUser();
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch {
      // Silent
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

      if (silent) toast.success(t("dashboard.refreshed"), { duration: 1500 });
    } catch (err) {
      toast.error(t("dashboard.errors.couldntLoad"), {
        description: t("dashboard.errors.pleaseRefresh"),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    loadAll(true);
  };

  const handleAddSuccess = () => {
    setRefreshKey((k) => k + 1);
    loadAll(true);
  };

  const currentUser = getUser();
  const canAddProperty =
    currentUser &&
    (currentUser.role === "ADMIN" ||
      ["BUYER", "REAL_ESTATE_AGENT"].includes(currentUser.role));

  const firstName =
    user?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";
  const subtitle = t("dashboard.subtitle");

  const isEmpty = stats && stats.totalProperties === 0;

  // Guard: redirect admin to /dashboard/admin, show nothing until role known
  if (!userRole || userRole === "ADMIN") {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-gray-900 dark:text-[#e6edf3]">
            {getGreeting(t)}
            {firstName ? (
              <span className="text-[#22C55E]">, {firstName}</span>
            ) : (
              ""
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">
            {subtitle}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="group flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] transition-all hover:border-[#22C55E] hover:shadow-[0_4px_12px_rgba(34,197,94,0.2)] disabled:opacity-50"
            aria-label={t("common.refresh")}
          >
            <RefreshCw
              size={16}
              className={`text-gray-600 dark:text-[#7d8590] transition-colors group-hover:text-[#22C55E] ${
                refreshing ? "animate-spin text-[#22C55E]" : ""
              }`}
            />
          </button>

          {canAddProperty && (
            <button
              onClick={() => setModalOpen(true)}
              className="group relative flex h-11 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_15px_40px_rgba(34,197,94,0.55)] active:scale-[0.97]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              <Plus size={18} className="relative z-10" strokeWidth={2.5} />
              <span className="relative z-10">{t("property.addProperty")}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Hero Strip ─────────────────────────────────────────────── */}
      {!isEmpty && (
        <ErrorBoundary>
          <HeroStrip
            stats={stats}
            loading={loading}
            key={`hero-${refreshKey}`}
          />
        </ErrorBoundary>
      )}

      {/* ── Portfolio trend chart ──────────────────────────────────── */}
      {!isEmpty && (
        <ErrorBoundary>
          <PortfolioTrendChart
            key={`trend-${refreshKey}`}
            refreshKey={refreshKey}
          />
        </ErrorBoundary>
      )}

      {/* ── Recommendations ────────────────────────────────────────── */}
      {!isEmpty && (
        <ErrorBoundary>
          <RecommendationsPanel
            key={`rec-${refreshKey}`}
            refreshKey={refreshKey}
          />
        </ErrorBoundary>
      )}

      {/* ── Portfolio map ──────────────────────────────────────────── */}
      {!isEmpty && (
        <ErrorBoundary>
          <PortfolioMap key={`map-${refreshKey}`} refreshKey={refreshKey} />
        </ErrorBoundary>
      )}

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : !stats ? (
        <div className="rounded-xl border border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#161b22] p-8 text-center text-sm text-gray-500 dark:text-[#7d8590]">
          {t("dashboard.errors.unableToLoadStats")}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          {/* Total properties */}
          <StatsCard
            title={t("dashboard.stats.totalProperties")}
            value={
              stats.totalProperties > 0
                ? stats.totalProperties.toLocaleString()
                : "—"
            }
            subtitle={
              stats.totalProperties === 0
                ? t("dashboard.stats.noPropertiesAdded")
                : formatTrend(t, trends?.propertiesThisWeek)
            }
            icon={<Building2 size={20} strokeWidth={2.5} />}
            trendValue={formatDelta(trends?.propertiesGrowthPct)}
            trendUp={trends ? trends.propertiesGrowthPct >= 0 : null}
            href="/dashboard/property-search"
          />

          {/* Verified */}
          <StatsCard
            title={t("dashboard.stats.verified")}
            value={
              stats.verifiedProperties > 0
                ? stats.verifiedProperties.toLocaleString()
                : "—"
            }
            subtitle={
              stats.totalProperties > 0
                ? t("dashboard.stats.ofTotal", {
                    pct: Math.round(
                      (stats.verifiedProperties / stats.totalProperties) * 100
                    ),
                  })
                : t("dashboard.stats.nothingToVerify")
            }
            icon={<ShieldCheck size={20} strokeWidth={2.5} />}
            trendValue={formatDelta(trends?.verifiedGrowthPct)}
            trendUp={trends ? trends.verifiedGrowthPct >= 0 : null}
            href="/dashboard/property-search?filter=verified"
          />

          {/* Pending */}
          <StatsCard
            title={t("dashboard.stats.pending")}
            value={
              stats.pendingProperties > 0
                ? stats.pendingProperties.toLocaleString()
                : "—"
            }
            subtitle={
              stats.pendingProperties > 0
                ? t("dashboard.stats.awaitingVerification")
                : t("dashboard.stats.allCaughtUp")
            }
            icon={<Clock size={20} strokeWidth={2.5} />}
            trendValue={null}
            href={
              stats.pendingProperties > 0
                ? "/dashboard/property-search?filter=pending"
                : undefined
            }
          />

          {/* Platform users */}
          <StatsCard
            title={t("dashboard.stats.platformUsers")}
            value={
              stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : "—"
            }
            subtitle={
              stats.activeUsers > 0
                ? t("dashboard.stats.activeIn30Days", { n: stats.activeUsers })
                : undefined
            }
            icon={<Users size={20} strokeWidth={2.5} />}
            trendValue={formatDelta(trends?.usersGrowthPct)}
            trendUp={trends ? trends.usersGrowthPct >= 0 : null}
          />
        </motion.div>
      )}

      {/* ── Portfolio breakdown + Recent properties ────────────────── */}
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

      {/* ── Activity feed ──────────────────────────────────────────── */}
      {!loading && !isEmpty && (
        <ErrorBoundary>
          <ActivityFeed key={`activity-${refreshKey}`} />
        </ErrorBoundary>
      )}

      {/* ── Empty state ────────────────────────────────────────────── */}
      {!loading && isEmpty && (
        <EmptyState onAddClick={() => setModalOpen(true)} />
      )}

      <AddPropertyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────
function EmptyState({ onAddClick }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-10 shadow-sm">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf7f3] dark:bg-[#0d2818]">
          <Building2
            className="h-7 w-7 text-[#16a34a] dark:text-green-400"
            strokeWidth={2}
          />
        </div>

        <h2 className="mt-5 text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
          {t("dashboard.empty.title")}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-[#7d8590] leading-relaxed">
          {t("dashboard.empty.description")}
        </p>

        <button
          type="button"
          onClick={onAddClick}
          className="mt-6 flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#22C55E] to-[#16a34a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] transition-all duration-150 hover:opacity-95 active:scale-95"
        >
          <Plus size={16} strokeWidth={2.5} />
          {t("property.addFirstProperty")}
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────
function getGreeting(t) {
  const hour = new Date().getHours();
  if (hour < 12) return t("dashboard.greetings.morning");
  if (hour < 17) return t("dashboard.greetings.afternoon");
  return t("dashboard.greetings.evening");
}

function formatDelta(pct) {
  if (pct == null || pct === 0) return null;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

function formatTrend(t, count) {
  if (count == null || count === 0) return undefined;
  return t("dashboard.stats.plusThisWeek", { count });
}