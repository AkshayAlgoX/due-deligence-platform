// frontend/src/services/reportService.js
import api from "@/services/api";
import { API_ROUTES } from "@/constants/apiRoutes";

/**
 * reportService — thin API client for all report endpoints.
 *
 * Mirrors ReportController exactly:
 *   POST   /api/reports/generate
 *   GET    /api/reports/:id/status
 *   GET    /api/reports/:id
 *   GET    /api/reports?page&size&sort
 *   DELETE /api/reports/:id
 *   GET    /api/reports/property/:propertyId
 *   POST   /api/reports/:id/regenerate
 */

const reportService = {
  /**
   * Kick off async report generation.
   * Returns 202 with a PENDING shell report (has id for polling).
   * @param {Object} payload - { propertyId, title?, forceRecalculate? }
   * @returns {Promise<DueDiligenceReportResponse>}
   */
  generate(payload) {
    return api
      .post(API_ROUTES.REPORTS.GENERATE, payload)
      .then((r) => r.data);
  },

  /**
   * Poll report status. Call every 2s until terminal (COMPLETED | FAILED).
   * @param {string|number} reportId
   * @returns {Promise<{ id, status, errorMessage? }>}
   */
  getStatus(reportId) {
    return api
      .get(API_ROUTES.REPORTS.STATUS(reportId))
      .then((r) => r.data);
  },

  /**
   * Fetch full report with all 8 sections.
   * Only call after status === COMPLETED.
   * @param {string|number} reportId
   * @returns {Promise<DueDiligenceReportResponse>}
   */
    getById(reportId) {
    return api
      .get(API_ROUTES.REPORTS.GET(reportId))
      .then((r) => r.data);
  },

  /**
   * Paginated list of reports for the current user.
   * @param {Object} params - { page?, size?, sort? }
   * @returns {Promise<Page<ReportSummaryDto>>}
   */
  list({ page = 0, size = 10, sort = "createdAt,desc" } = {}) {
    return api
      .get(API_ROUTES.REPORTS.LIST, { params: { page, size, sort } })
      .then((r) => r.data);
  },

  /**
   * All reports for one property (no pagination — usually < 10).
   * @param {string|number} propertyId
   * @returns {Promise<ReportSummaryDto[]>}
   */
  listByProperty(propertyId) {
    return api
      .get(API_ROUTES.REPORTS.BY_PROPERTY(propertyId))
      .then((r) => r.data);
  },

  /**
   * Regenerate — creates a new version of an existing report.
   * Returns 202 with a new PENDING shell report.
   * @param {string|number} reportId
   * @returns {Promise<DueDiligenceReportResponse>}
   */
  regenerate(reportId) {
    return api
      .post(API_ROUTES.REPORTS.REGENERATE(reportId))
      .then((r) => r.data);
  },

  /**
   * Delete a report permanently.
   * @param {string|number} reportId
   * @returns {Promise<void>}
   */
    delete(reportId) {
    return api
      .delete(API_ROUTES.REPORTS.DELETE(reportId))
      .then((r) => r.data);
  },
};

export default reportService;