"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { Database, Server, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        up
          ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
          : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${up ? "bg-green-500" : "bg-red-500"}`}
      />
      {status ?? "UNKNOWN"}
    </span>
  );
}

function HealthCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/30">
          <Icon size={18} className="text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">
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
    setLoading(true);
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
  }, [fetchHealth]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">
            {t("nav.admin.systemHealthTitle")}
          </h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-[#7d8590]">
            {t("nav.admin.systemHealthSubtitle")}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchHealth}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            className={`mr-1.5 ${loading ? "animate-spin" : ""}`}
          />
          {t("nav.admin.refresh")}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <HealthCard icon={Server} title={t("nav.admin.apiStatus")}>
            <StatusPill status={health?.apiStatus} />
          </HealthCard>

          <HealthCard icon={Database} title={t("nav.admin.databaseStatus")}>
            <StatusPill status={health?.dbStatus} />
          </HealthCard>

          <HealthCard icon={Clock} title={t("nav.admin.uptime")}>
            <p className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
              {formatUptime(health?.uptimeSeconds ?? 0)}
            </p>
          </HealthCard>
        </div>
      )}
    </div>
  );
}
