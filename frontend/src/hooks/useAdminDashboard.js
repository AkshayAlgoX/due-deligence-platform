"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  transformRiskData,
  transformTrendData,
  transformTopCitiesData,
} from "@/utils/analyticsUtils";

import {
  getAdminDashboardStats,
  getRiskDistribution,
  getReportsTrend,
  getTopCities,
  getSystemHealth,
  getUserActivityHeatmap,
} from "@/services/adminService";

export default function useAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState("Unknown");
  const [riskData, setRiskData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [topCities, setTopCities] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const [s, r, t, c, h, hm] = await Promise.all([
          getAdminDashboardStats("30d"),
          getRiskDistribution("30d"),
          getReportsTrend("30d", "daily"),
          getTopCities(10),
          getSystemHealth(),
          getUserActivityHeatmap(),
        ]);

        if (cancelled) return;

        setStats(s);

        setRiskData(transformRiskData(r));

        setTrendData(transformTrendData(t));

        setTopCities(transformTopCitiesData(c));

        setHeatmapData(hm);

        setSystemHealth(
          h.dbStatus === "UP" && h.apiStatus === "UP"
            ? "Operational"
            : "Degraded"
        );
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    loading,
    stats,
    systemHealth,
    riskData,
    trendData,
    topCities,
    heatmapData,
  };
}