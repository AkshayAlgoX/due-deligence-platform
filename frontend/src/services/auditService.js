import api from "./api";
import { downloadUrl } from "@/utils/downloadUtils";

// ─────────────────────────────────────────────────────────────
// Audit Log API Service
// Backend base path: /api/audit-logs
// ─────────────────────────────────────────────────────────────

/**
 * Get audit logs with optional filters.
 *
 * GET /api/audit-logs
 *
 * Supported query parameters:
 * page
 * size
 * action
 * userId
 * from
 * to
 */
export const getAuditLogs = async ({
  page = 0,
  size = 20,
  action,
  userId,
  from,
  to,
} = {}) => {
  const response = await api.get("/api/audit-logs", {
    params: {
      page,
      size,
      ...(action ? { action } : {}),
      ...(userId ? { userId } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    },
  });

  return response.data;
};

/**
 * Get complete details of one audit log.
 *
 * GET /api/audit-logs/{id}
 */
export const getAuditLogById = async (id) => {
  const response = await api.get(`/api/audit-logs/${id}`);

  return response.data;
};

/**
 * Get all audit logs belonging to a user.
 *
 * GET /api/audit-logs/user/{userId}
 */
export const getAuditLogsByUser = async (userId) => {
  const response = await api.get(`/api/audit-logs/user/${userId}`);

  return response.data;
};

/**
 * Get all audit logs belonging to a property.
 *
 * GET /api/audit-logs/property/{propertyId}
 */
export const getAuditLogsByProperty = async (propertyId) => {
  const response = await api.get(`/api/audit-logs/property/${propertyId}`);

  return response.data;
};

/**
 * Get audit dashboard statistics.
 *
 * GET /api/audit-logs/stats
 */
export const getAuditStatistics = async () => {
  const response = await api.get("/api/audit-logs/stats");

  return response.data;
};

/**
 * Download the exported audit log file.
 *
 * Uses direct URL download with cookie-based auth (auth_token cookie).
 * No blob URLs — server sends Content-Disposition: attachment.
 */
export const downloadAuditLogs = async (filters = {}) => {
  const params = new URLSearchParams({ format: "csv" });
  if (filters.action) params.set("action", filters.action);
  if (filters.userId) params.set("userId", String(filters.userId));
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  downloadUrl(`/api/audit-logs/export?${params.toString()}`);
};
