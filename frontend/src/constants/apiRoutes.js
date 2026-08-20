/**
 * Centralised API route constants.
 *
 * All paths are RELATIVE (e.g. "/api/auth/register").
 * Next.js rewrites them to https://duediligence-agent.duckdns.org/api/... server-side,
 * so the browser never makes a cross-origin request — no CORS issues.
 *
 * See: next.config.mjs → rewrites()
 */

export const API_ORIGIN = "https://duediligence-agent.duckdns.org";

export const API_ROUTES = {

  // ── Auth ──────────────────────────────────────────────────────────────────
  REGISTER_SEND_OTP:      API_ORIGIN + "/api/auth/register/send-otp",
  REGISTER_VERIFY_OTP:    API_ORIGIN + "/api/auth/register/verify-otp",
  REGISTER_RESEND_OTP:    API_ORIGIN + "/api/auth/register/resend-otp",
  LOGIN:                  API_ORIGIN + "/api/auth/login",
  GOOGLE_LOGIN:           API_ORIGIN + "/api/auth/google",
  COMPLETE_GOOGLE_SIGNUP: API_ORIGIN + "/api/auth/complete-google-signup",
  FORGOT_PASSWORD:        API_ORIGIN + "/api/auth/forgot-password",
  VERIFY_OTP:             API_ORIGIN + "/api/auth/verify-otp",
  RESET_PASSWORD:         API_ORIGIN + "/api/auth/reset-password",
  UPDATE_PROFILE:         API_ORIGIN + "/api/auth/me",
  CHANGE_PASSWORD:        API_ORIGIN + "/api/auth/change-password",
  LOGOUT_ALL_DEVICES:     API_ORIGIN + "/api/auth/logout-all-devices",

  // ── Properties ────────────────────────────────────────────────────────────
  PROPERTIES:          API_ORIGIN + "/api/properties",
  PROPERTY_BY_ID:      (id) => `/api/properties/${id}`,
  PROPERTY_AGGREGATED: (id) => `/api/properties/${id}/aggregated`,
  PROPERTY_SEARCH:     API_ORIGIN + "/api/properties/search",
  PROPERTIES_RECENT:   API_ORIGIN + "/api/properties/recent",
  PROPERTIES_GEO:      API_ORIGIN + "/api/properties/geo",
  PROPERTY_RISK:       (id) => `/api/properties/${id}/risk`,

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD_STATS:           API_ORIGIN + "/api/dashboard/stats",
  DASHBOARD_INSIGHTS:        API_ORIGIN + "/api/dashboard/insights",
  DASHBOARD_ACTIVITY:        API_ORIGIN + "/api/dashboard/activity",
  DASHBOARD_TRENDS:          API_ORIGIN + "/api/dashboard/trends",
  BUYER_DASHBOARD:           API_ORIGIN + "/api/buyer/dashboard",
  ADMIN_DASHBOARD:           API_ORIGIN + "/api/admin/dashboard",
  DASHBOARD_HISTORY:         API_ORIGIN + "/api/dashboard/history",
  DASHBOARD_RECOMMENDATIONS: API_ORIGIN + "/api/dashboard/recommendations",
ADMIN_DASHBOARD_STATS:             API_ORIGIN + "/api/admin/dashboard/stats",
  ADMIN_DASHBOARD_RISK_DISTRIBUTION: API_ORIGIN + "/api/admin/dashboard/risk-distribution",
  ADMIN_DASHBOARD_REPORTS_TREND:     API_ORIGIN + "/api/admin/dashboard/reports-trend",
  ADMIN_DASHBOARD_TOP_CITIES:        API_ORIGIN + "/api/admin/dashboard/top-cities",
  ADMIN_DASHBOARD_USER_ACTIVITY:     API_ORIGIN + "/api/admin/dashboard/user-activity-heatmap",
  ADMIN_DASHBOARD_ACTIVE_USERS:      API_ORIGIN + "/api/admin/dashboard/active-users",
  ADMIN_DASHBOARD_EXPORT:            API_ORIGIN + "/api/admin/dashboard/export",
  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMIN_USERS: API_ORIGIN + "/api/admin/users",
  ADMIN_USER_BY_ID:        (id) => `/api/admin/users/${id}`,
  ADMIN_UPDATE_USER_ROLE:  (id) => `/api/admin/users/${id}/role`,
  ADMIN_BAN_USER:          (id) => `/api/admin/users/${id}/ban`,
  ADMIN_UNBAN_USER:        (id) => `/api/admin/users/${id}/unban`,
  ADMIN_SYSTEM_HEALTH:     API_ORIGIN + "/api/admin/system/health",

  // ── Comparisons ───────────────────────────────────────────────────────────
  COMPARISONS:      API_ORIGIN + "/api/comparisons",
  COMPARISON_BY_ID: (id) => `/api/comparisons/${id}`,

  // ── Property Labels ───────────────────────────────────────────────────────
  GET_PROPERTY_LABELS:    (propertyId) => `/api/properties/${propertyId}/labels`,
  ADD_PROPERTY_LABEL:     (propertyId) => `/api/properties/${propertyId}/labels`,
  REMOVE_PROPERTY_LABEL:  (propertyId, labelId) => `/api/properties/${propertyId}/labels/${labelId}`,
  RECALCULATE_ALL_LABELS: API_ORIGIN + "/api/labels/recalculate-all",
  BULK_PROPERTY_LABELS:   API_ORIGIN + "/api/labels/bulk",

  // ── Export ────────────────────────────────────────────────────────────────
  EXPORT_PDF:            (reportId)   => `/api/export/report/${reportId}/pdf`,
  EXPORT_EXCEL:          (reportId)   => `/api/export/report/${reportId}/excel`,
  EXPORT_PROPERTY_PDF:   (propertyId) => `/api/export/property/${propertyId}/pdf`,
  EXPORT_PROPERTY_EXCEL: (propertyId) => `/api/export/property/${propertyId}/excel`,
  EXPORT_PREVIEW:        (reportId)   => `/api/export/report/${reportId}/preview`,
  EXPORT_BULK:           API_ORIGIN + "/api/export/bulk",
  EXPORT_HISTORY:        API_ORIGIN + "/api/export/history",
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
    GENERATE:    API_ORIGIN + "/api/reports/generate",
    STATUS:      (reportId)   => `/api/reports/${reportId}/status`,
    GET:         (reportId)   => `/api/reports/${reportId}`,
    LIST:        API_ORIGIN + "/api/reports",
    DELETE:      (reportId)   => `/api/reports/${reportId}`,
    BY_PROPERTY: (propertyId) => `/api/reports/property/${propertyId}`,
    REGENERATE:  (reportId)   => `/api/reports/${reportId}/regenerate`,
  },

  // ── Audit Logs ────────────────────────────────────────────────────────────
  //
  // GET /api/audit-logs?page=0&size=20&action=REPORT_GENERATED&userId=5
  //                    &from=2025-01-01&to=2025-01-31
  AUDIT_LOGS: {
    LIST:        API_ORIGIN + "/api/audit-logs",
    BY_USER:     (userId)     => `/api/audit-logs/user/${userId}`,
    BY_PROPERTY: (propertyId) => `/api/audit-logs/property/${propertyId}`,
    EXPORT:      API_ORIGIN + "/api/audit-logs/export",
    STATS:       API_ORIGIN + "/api/audit-logs/stats",
  },

  // ── Report History ────────────────────────────────────────────────────────
  REPORT_HISTORY: {
    LIST:     API_ORIGIN + "/api/report-history",
    VERSIONS: (reportId) => `/api/report-history/${reportId}/versions`,
    ARCHIVE:  (reportId) => `/api/report-history/${reportId}/archive`,
    SHARE:    (reportId) => `/api/report-history/${reportId}/share`,
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    LIST:          API_ORIGIN + "/api/notifications",
    UNREAD_COUNT:  API_ORIGIN + "/api/notifications/unread-count",
    MARK_READ:     (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: API_ORIGIN + "/api/notifications/mark-all-read",
    DELETE:        (id) => `/api/notifications/${id}`,
    CLEAR_ALL:     API_ORIGIN + "/api/notifications/clear-all",
    PREFERENCES:   API_ORIGIN + "/api/notifications/preferences",
    TEST:          API_ORIGIN + "/api/notifications/test",
    SEND_BULK:     API_ORIGIN + "/api/notifications/send-bulk",
  },

  // ── SSE ───────────────────────────────────────────────────────────────────
  SSE_NOTIFICATIONS: API_ORIGIN + "/api/sse/notifications",

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