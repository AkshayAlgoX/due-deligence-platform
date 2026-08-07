/**
 * Admin service — talks to Spring Boot backend admin endpoints.
 *
 * Covers:
 *   - Dashboard analytics (stats, risk distribution, trends, top cities, etc.)
 *   - User management (list, detail, role update, ban/unban)
 *   - System health
 *
 * All endpoints require ROLE_ADMIN on the backend — enforced server-side
 * in SecurityConfig, and mirrored client-side via AuthGuard.
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

// ── Dashboard stats ──────────────────────────────────────────────────────────

/** KPI counts: total users, properties, reports this month, avg risk score, trends. */
export const getAdminDashboardStats = async (period = "30d") => {
  const { data } = await api.get(API_ROUTES.ADMIN_DASHBOARD_STATS, {
    params: { period },
  });

  return {
    totalUsers: data.totalUsers ?? 0,
    totalProperties: data.totalProperties ?? 0,
    reportsThisMonth: data.reportsThisMonth ?? 0,
    avgRiskScore: data.avgRiskScore ?? 0,
    trends: {
      usersGrowth: data.trends?.usersGrowth ?? 0,
      propertiesGrowth: data.trends?.propertiesGrowth ?? 0,
      reportsGrowth: data.trends?.reportsGrowth ?? 0,
      riskChange: data.trends?.riskChange ?? 0,
    },
  };
};

/** Risk distribution breakdown (LOW/MED/HIGH/CRITICAL counts). */
export const getRiskDistribution = async (period = "30d") => {
  const { data } = await api.get(API_ROUTES.ADMIN_DASHBOARD_RISK_DISTRIBUTION, {
    params: { period },
  });
  return (data ?? []).map((d) => ({
    level: d.level ?? "LOW",
    count: d.count ?? 0,
  }));
};

/** Reports generated over time, for the trend line chart. */
export const getReportsTrend = async (period = "30d", granularity = "daily") => {
  const { data } = await api.get(API_ROUTES.ADMIN_DASHBOARD_REPORTS_TREND, {
    params: { period, granularity },
  });
  return (data ?? []).map((d) => ({
    date: d.date ?? "",
    count: d.count ?? 0,
  }));
};

/** Top cities by activity/property count. */
export const getTopCities = async (limit = 10) => {
  const { data } = await api.get(API_ROUTES.ADMIN_DASHBOARD_TOP_CITIES, {
    params: { limit },
  });
  return (data ?? []).map((d) => ({
    city: d.city ?? "",
    count: d.count ?? 0,
  }));
};

/** User activity heatmap — day-of-week × hour grid. */
export const getUserActivityHeatmap = async () => {
  const { data } = await api.get(API_ROUTES.ADMIN_DASHBOARD_USER_ACTIVITY);
  return data ?? [];
};

/** Currently active user count. */
export const getActiveUsers = async () => {
  const { data } = await api.get(API_ROUTES.ADMIN_DASHBOARD_ACTIVE_USERS);
  return data?.activeUsers ?? 0;
};

/** Export dashboard analytics (returns a file blob — for direct download). */
export const exportDashboardAnalytics = async (format = "excel") => {
  const response = await api.get(API_ROUTES.ADMIN_DASHBOARD_EXPORT, {
    params: { format },
    responseType: "blob",
  });
  return response.data;
};

// ── User management ──────────────────────────────────────────────────────────

/** Paginated, searchable, filterable user list. */
export const listUsers = async ({ page = 0, size = 20, search = "", role = "" } = {}) => {
  const { data } = await api.get(API_ROUTES.ADMIN_USERS, {
    params: { page, size, search: search || undefined, role: role || undefined },
  });

  return {
    users: (data.content ?? []).map((u) => ({
      id: u.id,
      fullName: u.fullName ?? "",
      email: u.email ?? "",
      role: u.role ?? "",
      isActive: u.isActive ?? true,
      isBanned: u.isBanned ?? false,
      createdAt: u.createdAt ?? null,
    })),
    totalElements: data.totalElements ?? 0,
    totalPages: data.totalPages ?? 0,
    currentPage: data.number ?? 0,
  };
};

/** Single user detail. */
export const getUserById = async (userId) => {
  const { data } = await api.get(API_ROUTES.ADMIN_USER_BY_ID(userId));
  return data;
};

/** Change a user's role. */
export const updateUserRole = async (userId, role) => {
  const { data } = await api.put(API_ROUTES.ADMIN_UPDATE_USER_ROLE(userId), { role });
  return data;
};

/** Ban a user. */
export const banUser = async (userId) => {
  const { data } = await api.put(API_ROUTES.ADMIN_BAN_USER(userId));
  return data;
};

/** Unban a user. */
export const unbanUser = async (userId) => {
  const { data } = await api.put(API_ROUTES.ADMIN_UNBAN_USER(userId));
  return data;
};

// ── System health ────────────────────────────────────────────────────────────

/** DB connectivity + uptime status. */
export const getSystemHealth = async () => {
  const { data } = await api.get(API_ROUTES.ADMIN_SYSTEM_HEALTH);
  return {
    dbStatus: data.dbStatus ?? "UNKNOWN",
    apiStatus: data.apiStatus ?? "UNKNOWN",
    uptimeSeconds: data.uptimeSeconds ?? 0,
  };
};