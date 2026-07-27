/**
 * Dashboard service — talks to real Spring Boot backend.
 *
 * Endpoints:
 *   GET /api/dashboard/stats     → KPI counts
 *   GET /api/dashboard/insights  → portfolio analytics
 *   GET /api/dashboard/activity  → recent activity feed
 *   GET /api/dashboard/trends    → week-over-week deltas
 *
 * Every field is real DB data. No invented numbers.
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

/** Fetch real dashboard KPI stats. */
export const getDashboardStats = async () => {
  const { data } = await api.get(API_ROUTES.DASHBOARD_STATS);

  return {
    totalProperties: data.totalProperties ?? 0,
    verifiedProperties: data.verifiedProperties ?? 0,
    pendingProperties: data.pendingProperties ?? 0,
    totalUsers: data.totalUsers ?? 0,
    activeUsers: data.activeUsers ?? 0,
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

/** Fetch portfolio-level analytics. */
export const getPortfolioInsights = async () => {
  const { data } = await api.get(API_ROUTES.DASHBOARD_INSIGHTS);

  return {
    totalPortfolioValue: data.totalPortfolioValue ?? 0,
    averagePropertyValue: data.averagePropertyValue ?? 0,
    highestValueProperty: data.highestValueProperty
      ? {
          id: data.highestValueProperty.id,
          address: data.highestValueProperty.address ?? "",
          city: data.highestValueProperty.city ?? "",
          marketValue: data.highestValueProperty.marketValue ?? 0,
        }
      : null,
    distributionByType: (data.distributionByType ?? []).map((d) => ({
      propertyType: d.propertyType ?? "Unknown",
      count: d.count ?? 0,
      totalValue: d.totalValue ?? 0,
    })),
    distributionByCity: (data.distributionByCity ?? []).map((d) => ({
      city: d.city ?? "",
      count: d.count ?? 0,
    })),
    userTopCity: data.userTopCity ?? null,
    totalCitiesCovered: data.totalCitiesCovered ?? 0,
  };
};

/** Fetch recent activity feed (default 10 items). */
export const getRecentActivity = async (limit = 10) => {
  const { data } = await api.get(API_ROUTES.DASHBOARD_ACTIVITY, {
    params: { limit },
  });

  return (data ?? []).map((item) => ({
    type: item.type ?? "PROPERTY_UPDATED",
    propertyId: item.propertyId,
    propertyAddress: item.propertyAddress ?? "",
    propertyCity: item.propertyCity ?? "",
    timestamp: item.timestamp ? new Date(item.timestamp) : null,
    actorName: item.actorName ?? null,
  }));
};

/** Fetch week-over-week trend deltas. */
export const getDashboardTrends = async () => {
  const { data } = await api.get(API_ROUTES.DASHBOARD_TRENDS);

  return {
    propertiesThisWeek: data.propertiesThisWeek ?? 0,
    propertiesLastWeek: data.propertiesLastWeek ?? 0,
    propertiesGrowthPct: data.propertiesGrowthPct ?? 0,
    verifiedThisWeek: data.verifiedThisWeek ?? 0,
    verifiedLastWeek: data.verifiedLastWeek ?? 0,
    verifiedGrowthPct: data.verifiedGrowthPct ?? 0,
    newUsersThisWeek: data.newUsersThisWeek ?? 0,
    newUsersLastWeek: data.newUsersLastWeek ?? 0,
    usersGrowthPct: data.usersGrowthPct ?? 0,
  };
};

/**
 * Fetch portfolio snapshot history for trend chart.
 * days: 7 | 30 | 90
 * Returns array of { date, totalValue, propertyCount, verifiedCount, totalCities }
 */
export const getPortfolioHistory = async (days = 30) => {
  const { data } = await api.get(API_ROUTES.DASHBOARD_HISTORY, {
    params: { days },
  });

  return (data ?? []).map((point) => ({
    date: point.date ?? "",
    totalValue: point.totalValue ?? 0,
    propertyCount: point.propertyCount ?? 0,
    verifiedCount: point.verifiedCount ?? 0,
    totalCities: point.totalCities ?? 0,
  }));
};

/**
 * Fetch rule-based recommendations from real portfolio data.
 * Returns array of { type, severity, title, description, propertyId, actionUrl, actionLabel }
 */
export const getDashboardRecommendations = async () => {
  const { data } = await api.get(API_ROUTES.DASHBOARD_RECOMMENDATIONS);

  return (data ?? []).map((r) => ({
    type: r.type ?? "",
    severity: r.severity ?? "LOW",
    title: r.title ?? "",
    description: r.description ?? "",
    propertyId: r.propertyId ?? null,
    actionUrl: r.actionUrl ?? null,
    actionLabel: r.actionLabel ?? null,
  }));
};

/**
 * Fetch advanced dashboard analytics.
 * Returns real aggregated portfolio data. No invented numbers.
 */
export const getDashboardAnalytics = async () => {
  const { data } = await api.get(API_ROUTES.DASHBOARD_ANALYTICS);

  return {
    avgValueByType: data.avgValueByType ?? [],
    pricePerSqftByCity: data.pricePerSqftByCity ?? [],
    verificationRateByCity: data.verificationRateByCity ?? [],
    portfolioConcentration: data.portfolioConcentration ?? null,
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