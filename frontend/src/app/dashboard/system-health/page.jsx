"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, CheckCircle2, XCircle, Loader2, Activity } from "lucide-react";

import AdminGuard from "@/components/auth/AdminGuard";
import api from "@/services/api";

function SystemHealthContent() {
  const [statuses, setStatuses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatuses = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const { data } = await api.get("/api/health/integrations");
      setStatuses(data);
    } catch (err) {
      setError(err?.message || "Failed to load integration status");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf7f3] dark:bg-[#0d2818]">
              <Activity className="h-4.5 w-4.5 text-[#16a34a] dark:text-green-400" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight">
                System Health
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                Real-time status of external API integrations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchStatuses(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-[#e6edf3] transition-all hover:border-[#22C55E] hover:text-[#16a34a] disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} strokeWidth={2.4} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300 dark:text-[#7d8590]" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 p-6 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statuses?.map((s) => (
              <div
                key={s.name}
                className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3] leading-tight">
                    {s.name}
                  </p>
                  {s.status === "UP" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" strokeWidth={2.2} />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" strokeWidth={2.2} />
                  )}
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                    s.status === "UP"
                      ? "bg-green-50 dark:bg-[#0d2818] text-green-700 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {s.status}
                </span>

                <p className="mt-3 text-xs text-gray-500 dark:text-[#7d8590] leading-relaxed">
                  {s.message}
                </p>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#30363d] flex items-center justify-between text-[11px] text-gray-400 dark:text-[#6e7681]">
                  <span>{s.responseTimeMs}ms</span>
                  <span>{new Date(s.checkedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SystemHealthPage() {
  return (
    <AdminGuard>
      <SystemHealthContent />
    </AdminGuard>
  );
}