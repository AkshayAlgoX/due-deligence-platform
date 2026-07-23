/**
 * Centralised API route constants.
 *
 * All paths are RELATIVE (e.g. "/api/auth/register").
 * Next.js rewrites them to http://localhost:8080/api/... server-side,
 * so the browser never makes a cross-origin request — no CORS issues.
 *
 * See: next.config.mjs → rewrites()
 */

export const API_ROUTES = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  REGISTER: "/api/auth/register",
  LOGIN:    "/api/auth/login",
  GOOGLE_LOGIN: "/api/auth/google",
  COMPLETE_GOOGLE_SIGNUP: "/api/auth/complete-google-signup",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  VERIFY_OTP: "/api/auth/verify-otp",
  RESET_PASSWORD: "/api/auth/reset-password",
  UPDATE_PROFILE: "/api/auth/me",
  CHANGE_PASSWORD: "/api/auth/change-password",

  // ── Properties ────────────────────────────────────────────────────────────
  PROPERTIES:      "/api/properties",
  PROPERTY_BY_ID:  (id) => `/api/properties/${id}`,
  PROPERTY_AGGREGATED: (id) => `/api/properties/${id}/aggregated`,
  PROPERTY_SEARCH: "/api/properties/search",
  PROPERTIES_RECENT: "/api/properties/recent",
  PROPERTIES_GEO: "/api/properties/geo",

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD_STATS:    "/api/dashboard/stats",
  DASHBOARD_INSIGHTS: "/api/dashboard/insights",
  DASHBOARD_ACTIVITY: "/api/dashboard/activity",
  DASHBOARD_TRENDS:   "/api/dashboard/trends",
  BUYER_DASHBOARD:    "/api/buyer/dashboard",
  ADMIN_DASHBOARD:    "/api/admin/dashboard",
  DASHBOARD_HISTORY: "/api/dashboard/history",
  DASHBOARD_RECOMMENDATIONS: "/api/dashboard/recommendations",

  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMIN_USERS: "/api/admin/users",
};