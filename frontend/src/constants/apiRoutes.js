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

  // ── Properties ────────────────────────────────────────────────────────────
  PROPERTIES:     "/api/properties",
  PROPERTY_BY_ID: (id) => `/api/properties/${id}`,

  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMIN_USERS: "/api/admin/users",
};
