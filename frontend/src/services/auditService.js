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
 * GET /api/audit-logs/export → blob → trigger download
 * Uses shared download utilities for consistent behavior.
 */
export const downloadAuditLogs = async (filters = {}) => {
  const { downloadBlob } = await import("@/utils/downloadUtils");

  const response = await api.get("/api/audit-logs/export", {
    params: {
      format: "csv",
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: filters.to } : {}),
    },
    responseType: "blob",
  });

  // Detect JSON error responses disguised as blobs
  const blob = response.data;
  if (!blob || !(blob instanceof Blob)) {
    throw new Error("Invalid response from server");
  }
  if (blob.size === 0) {
    throw new Error("Server returned an empty CSV file");
  }
  // Check if response is JSON error (backend returns 4xx/5xx as JSON)
  const header = await blob.slice(0, 100).text();
  if (header.startsWith('{"success":false')) {
    const full = await blob.text();
    try {
      const parsed = JSON.parse(full);
      throw new Error(parsed.message || "Failed to export audit logs");
    } catch (e) {
      if (e.message && !e.message.startsWith("Failed to export")) throw e;
      throw new Error("Failed to export audit logs");
    }
  }

  downloadBlob(blob, "audit_logs.csv");
};
