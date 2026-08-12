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
  REGISTER_SEND_OTP:      "/api/auth/register/send-otp",
  REGISTER_VERIFY_OTP:    "/api/auth/register/verify-otp",
  REGISTER_RESEND_OTP:    "/api/auth/register/resend-otp",
  LOGIN:                  "/api/auth/login",
  GOOGLE_LOGIN:           "/api/auth/google",
  COMPLETE_GOOGLE_SIGNUP: "/api/auth/complete-google-signup",
  FORGOT_PASSWORD:        "/api/auth/forgot-password",
  VERIFY_OTP:             "/api/auth/verify-otp",
  RESET_PASSWORD:         "/api/auth/reset-password",
  UPDATE_PROFILE:         "/api/auth/me",
  CHANGE_PASSWORD:        "/api/auth/change-password",
  LOGOUT_ALL_DEVICES:     "/api/auth/logout-all-devices",

  // ── Properties ────────────────────────────────────────────────────────────
  PROPERTIES:          "/api/properties",
  PROPERTY_BY_ID:      (id) => `/api/properties/${id}`,
  PROPERTY_AGGREGATED: (id) => `/api/properties/${id}/aggregated`,
  PROPERTY_SEARCH:     "/api/properties/search",
  PROPERTIES_RECENT:   "/api/properties/recent",
  PROPERTIES_GEO:      "/api/properties/geo",
  PROPERTY_RISK:       (id) => `/api/properties/${id}/risk`,

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD_STATS:           "/api/dashboard/stats",
  DASHBOARD_INSIGHTS:        "/api/dashboard/insights",
  DASHBOARD_ACTIVITY:        "/api/dashboard/activity",
  DASHBOARD_TRENDS:          "/api/dashboard/trends",
  BUYER_DASHBOARD:           "/api/buyer/dashboard",
  ADMIN_DASHBOARD:           "/api/admin/dashboard",
  DASHBOARD_HISTORY:         "/api/dashboard/history",
  DASHBOARD_RECOMMENDATIONS: "/api/dashboard/recommendations",
ADMIN_DASHBOARD_STATS:             "/api/admin/dashboard/stats",
  ADMIN_DASHBOARD_RISK_DISTRIBUTION: "/api/admin/dashboard/risk-distribution",
  ADMIN_DASHBOARD_REPORTS_TREND:     "/api/admin/dashboard/reports-trend",
  ADMIN_DASHBOARD_TOP_CITIES:        "/api/admin/dashboard/top-cities",
  ADMIN_DASHBOARD_USER_ACTIVITY:     "/api/admin/dashboard/user-activity-heatmap",
  ADMIN_DASHBOARD_ACTIVE_USERS:      "/api/admin/dashboard/active-users",
  ADMIN_DASHBOARD_EXPORT:            "/api/admin/dashboard/export",
  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMIN_USERS: "/api/admin/users",
  ADMIN_USER_BY_ID:        (id) => `/api/admin/users/${id}`,
  ADMIN_UPDATE_USER_ROLE:  (id) => `/api/admin/users/${id}/role`,
  ADMIN_BAN_USER:          (id) => `/api/admin/users/${id}/ban`,
  ADMIN_UNBAN_USER:        (id) => `/api/admin/users/${id}/unban`,
  ADMIN_SYSTEM_HEALTH:     "/api/admin/system/health",

  // ── Comparisons ───────────────────────────────────────────────────────────
  COMPARISONS:      "/api/comparisons",
  COMPARISON_BY_ID: (id) => `/api/comparisons/${id}`,

  // ── Property Labels ───────────────────────────────────────────────────────
  GET_PROPERTY_LABELS:    (propertyId) => `/api/properties/${propertyId}/labels`,
  ADD_PROPERTY_LABEL:     (propertyId) => `/api/properties/${propertyId}/labels`,
  REMOVE_PROPERTY_LABEL:  (propertyId, labelId) => `/api/properties/${propertyId}/labels/${labelId}`,
  RECALCULATE_ALL_LABELS: "/api/labels/recalculate-all",
  BULK_PROPERTY_LABELS:   "/api/labels/bulk",

  // ── Export ────────────────────────────────────────────────────────────────
  EXPORT_PDF:            (reportId)   => `/api/export/report/${reportId}/pdf`,
  EXPORT_EXCEL:          (reportId)   => `/api/export/report/${reportId}/excel`,
  EXPORT_PROPERTY_PDF:   (propertyId) => `/api/export/property/${propertyId}/pdf`,
  EXPORT_PROPERTY_EXCEL: (propertyId) => `/api/export/property/${propertyId}/excel`,
  EXPORT_PREVIEW:        (reportId)   => `/api/export/report/${reportId}/preview`,
  EXPORT_BULK:           "/api/export/bulk",
  EXPORT_HISTORY:        "/api/export/history",
  EXPORT_DOWNLOAD:       (exportId)   => `/api/export/${exportId}/download`,

  // ── Risk Assessment ───────────────────────────────────────────────────────
  RISK: {
    GET:         (propertyId) => `/api/properties/${propertyId}/risk`,
    BREAKDOWN:   (propertyId) => `/api/properties/${propertyId}/risk/breakdown`,
    HISTORY:     (propertyId) => `/api/properties/${propertyId}/risk/history`,
    RECALCULATE: (propertyId) => `/api/properties/${propertyId}/risk/recalculate`,
  },

  // ── Due Diligence Reports ─────────────────────────────────────────────────
  REPORTS: {
    GENERATE:    "/api/reports/generate",
    STATUS:      (reportId)   => `/api/reports/${reportId}/status`,
    GET:         (reportId)   => `/api/reports/${reportId}`,
    LIST:        "/api/reports",
    DELETE:      (reportId)   => `/api/reports/${reportId}`,
    BY_PROPERTY: (propertyId) => `/api/reports/property/${propertyId}`,
    REGENERATE:  (reportId)   => `/api/reports/${reportId}/regenerate`,
  },

  // ── Audit Logs ────────────────────────────────────────────────────────────
  //
  // GET /api/audit-logs?page=0&size=20&action=REPORT_GENERATED&userId=5
  //                    &from=2025-01-01&to=2025-01-31
  AUDIT_LOGS: {
    LIST:        "/api/audit-logs",
    BY_USER:     (userId)     => `/api/audit-logs/user/${userId}`,
    BY_PROPERTY: (propertyId) => `/api/audit-logs/property/${propertyId}`,
    EXPORT:      "/api/audit-logs/export",
    STATS:       "/api/audit-logs/stats",
  },

  // ── Report History ────────────────────────────────────────────────────────
  REPORT_HISTORY: {
    LIST:     "/api/report-history",
    VERSIONS: (reportId) => `/api/report-history/${reportId}/versions`,
    ARCHIVE:  (reportId) => `/api/report-history/${reportId}/archive`,
    SHARE:    (reportId) => `/api/report-history/${reportId}/share`,
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    LIST:          "/api/notifications",
    UNREAD_COUNT:  "/api/notifications/unread-count",
    MARK_READ:     (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: "/api/notifications/mark-all-read",
    DELETE:        (id) => `/api/notifications/${id}`,
    CLEAR_ALL:     "/api/notifications/clear-all",
    PREFERENCES:   "/api/notifications/preferences",
    TEST:          "/api/notifications/test",
    SEND_BULK:     "/api/notifications/send-bulk",
  },

  // ── SSE ───────────────────────────────────────────────────────────────────
  SSE_NOTIFICATIONS: "/api/sse/notifications",

  // ── Comparable Properties ─────────────────────────────────────────────────
  COMPARABLE: {
    LIST:         (propertyId)          => `/api/properties/${propertyId}/comparables`,
    MAP_DATA:     (propertyId)          => `/api/properties/${propertyId}/comparables/map-data`,
    SIMILARITY:   (propertyId, compId)  => `/api/properties/${propertyId}/comparables/${compId}/similarity`,
    SEARCH:       (propertyId)          => `/api/properties/${propertyId}/comparables/search`,
    PRICE_TRENDS: (propertyId)          => `/api/properties/${propertyId}/comparables/price-trends`,
  },

  // ── Property Valuation ────────────────────────────────────────────────────
  VALUATION: {
    GET:               (propertyId) => `/api/properties/${propertyId}/valuation`,
    CALCULATE:         (propertyId) => `/api/properties/${propertyId}/valuation/calculate`,
    METHODS_BREAKDOWN: (propertyId) => `/api/properties/${propertyId}/valuation/methods-breakdown`,
    PRICE_HISTORY:     (propertyId) => `/api/properties/${propertyId}/valuation/price-history`,
  },
};