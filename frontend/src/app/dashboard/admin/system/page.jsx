"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { Database, Server, Clock, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { getSystemHealth } from "@/services/adminService";

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function StatusPill({ status }) {
  const up = status === "UP";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border ${
        up
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
          : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${up ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
      />
      {status ?? "UNKNOWN"}
    </span>
  );
}

function HealthCard({ icon: Icon, title, children, accent = "green" }) {
  const accentMap = {
    green: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    blue: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    purple: "from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="group rounded-2xl border border-gray-200/70 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 transition-all duration-200 hover:border-gray-300 dark:hover:border-[#484f58] hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-black/20">
      <div className="flex items-center gap-3 mb-5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accentMap[accent]} border`}>
          <Icon size={18} />
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900 dark:text-[#e6edf3] tracking-tight">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export default function AdminSystemPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);

  const fetchHealth = useCallback(async () => {
    try {
      const h = await getSystemHealth();
      setHealth(h);
    } catch {
      toast.error(t("nav.admin.activeUsersFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-6 py-8 space-y-8">
        <header className="flex items-start gap-4">
          <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 border border-orange-500/20">
            <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-[28px] leading-tight font-bold tracking-tight text-gray-900 dark:text-[#e6edf3]">
              {t("nav.admin.systemHealthTitle")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">
              {t("nav.admin.systemHealthSubtitle")} · Auto-refreshes every 30s
            </p>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <HealthCard icon={Server} title={t("nav.admin.apiStatus")} accent="green">
              <StatusPill status={health?.apiStatus} />
            </HealthCard>

            <HealthCard icon={Database} title={t("nav.admin.databaseStatus")} accent="blue">
              <StatusPill status={health?.dbStatus} />
            </HealthCard>

            <HealthCard icon={Clock} title={t("nav.admin.uptime")} accent="purple">
              <p className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight">
                {formatUptime(health?.uptimeSeconds ?? 0)}
              </p>
            </HealthCard>
          </div>
        )}
      </div>
    </div>
  );
}