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


  // ── Properties ────────────────────────────────────────────────────────────
  PROPERTIES:      "/api/properties",
  PROPERTY_BY_ID:  (id) => `/api/properties/${id}`,
  PROPERTY_SEARCH: "/api/properties/search",
  PROPERTIES_RECENT: "/api/properties/recent",   // NEW

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD_STATS:  "/api/dashboard/stats",
  BUYER_DASHBOARD:  "/api/buyer/dashboard",
  ADMIN_DASHBOARD:  "/api/admin/dashboard",

  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMIN_USERS: "/api/admin/users",
};