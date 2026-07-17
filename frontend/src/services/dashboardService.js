/**
 * Dashboard service — talks to real Spring Boot backend.
 *
 * Backend endpoint: GET /api/dashboard/stats
 * Returns: { totalProperties, reportsGenerated, avgRiskScore, activeAlerts, trends }
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

/** Fetch real dashboard KPI stats from backend. */
export const getDashboardStats = async () => {
  try {
    const response = await api.get(API_ROUTES.DASHBOARD_STATS);
    return response.data;
  } catch (err) {
    // Fallback on error
    return {
      totalProperties: 0,
      reportsGenerated: 0,
      avgRiskScore: 0,
      activeAlerts: 0,
      trends: {
        propertiesGrowth: 0,
        reportsGrowth: 0,
        riskChange: 0,
        alertsChange: 0,
      },
    };
  }
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