import api from "./api";

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
 * Export audit logs.
 *
 * GET /api/audit-logs/export
 *
 * Current backend export format:
 * CSV
 */
export const exportAuditLogs = async ({
  format = "csv",
  action,
  userId,
  from,
  to,
} = {}) => {
  const response = await api.get("/api/audit-logs/export", {
    params: {
      format,
      ...(action ? { action } : {}),
      ...(userId ? { userId } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    },
    responseType: "blob",
  });

  return response;
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
 * This helper creates a browser download from the Axios blob response.
 */
export const downloadAuditLogs = async (filters = {}) => {
  const response = await exportAuditLogs(filters);

  const blob = new Blob([response.data], {
    type: "text/csv;charset=utf-8;",
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "audit_logs.csv";

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};