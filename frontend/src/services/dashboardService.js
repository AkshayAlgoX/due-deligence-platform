/**
 * Dashboard service — talks to real Spring Boot backend.
 *
 * Backend endpoint: GET /api/dashboard/stats
 * Every field is a real DB count. No invented numbers.
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

/** Fetch real dashboard KPI stats from backend. */
export const getDashboardStats = async () => {
  const { data } = await api.get(API_ROUTES.DASHBOARD_STATS);

  return {
    totalProperties: data.totalProperties ?? 0,
    verifiedProperties: data.verifiedProperties ?? 0,   // NEW
    pendingProperties: data.pendingProperties ?? 0,     // NEW
    totalUsers: data.totalUsers ?? 0,
    reportsGenerated: data.reportsGenerated ?? 0,
    activeAlerts: data.activeAlerts ?? 0,
    trends: {
      propertiesGrowth: data.trends?.propertiesGrowth ?? 0,
      reportsGrowth: data.trends?.reportsGrowth ?? 0,
      riskChange: data.trends?.riskChange ?? 0,
      alertsChange: data.trends?.alertsChange ?? 0,
    },
  };
};

/** Buyer welcome message. */
export const getBuyerDashboard = async () => {
  const response = await api.get(API_ROUTES.BUYER_DASHBOARD);
  return response.data;
};

/** Admin welcome message. */
export const getAdminDashboard = async () => {
  const response = await api.get(API_ROUTES.ADMIN_DASHBOARD);
  return response.data;
};