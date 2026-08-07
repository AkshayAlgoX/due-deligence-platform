// frontend/src/services/exportService.js
import api from "@/services/api";
import { API_ROUTES } from "@/constants/apiRoutes";

/**
 * exportService — Thin API client for PDF/Excel export endpoints.
 * Uses shared axios instance (api.js) which handles JWT bearer token and response interceptors.
 */
export const exportService = {
  /**
   * Export report as PDF binary blob.
   * @param {string|number} reportId
   * @returns {Promise<Blob>}
   */
  exportPdf(reportId) {
    return api
      .get(API_ROUTES.EXPORT_PDF(reportId), { responseType: "blob" })
      .then((r) => r.data);
  },

  /**
   * Export report as Excel binary blob.
   * @param {string|number} reportId
   * @returns {Promise<Blob>}
   */
  exportExcel(reportId) {
    return api
      .get(API_ROUTES.EXPORT_EXCEL(reportId), { responseType: "blob" })
      .then((r) => r.data);
  },

  /**
   * Export property details as PDF binary blob.
   * @param {string|number} propertyId
   * @returns {Promise<Blob>}
   */
  exportPropertyPdf(propertyId) {
    return api
      .get(API_ROUTES.EXPORT_PROPERTY_PDF(propertyId), { responseType: "blob" })
      .then((r) => r.data);
  },

  /**
   * Export property details as Excel binary blob.
   * @param {string|number} propertyId
   * @returns {Promise<Blob>}
   */
  exportPropertyExcel(propertyId) {
    return api
      .get(API_ROUTES.EXPORT_PROPERTY_EXCEL(propertyId), { responseType: "blob" })
      .then((r) => r.data);
  },

  /**
   * Fetch report executive summary preview.
   * @param {string|number} reportId
   * @returns {Promise<Object>}
   */
  previewReport(reportId) {
    return api
      .get(API_ROUTES.EXPORT_PREVIEW(reportId))
      .then((r) => r.data);
  },

  /**
   * Alias for previewReport.
   * @param {string|number} reportId
   * @returns {Promise<Object>}
   */
  getPreview(reportId) {
    return this.previewReport(reportId);
  },

  /**
   * Download bulk exports as ZIP blob.
   * @param {Array<string|number>} reportIds
   * @param {string} format
   * @returns {Promise<Blob>}
   */
  downloadBulk(reportIds, format = "pdf") {
    return api
      .post(
        API_ROUTES.EXPORT_BULK,
        { reportIds, format },
        { responseType: "blob" }
      )
      .then((r) => r.data);
  },

  /**
   * Alias for downloadBulk.
   * @param {Array<string|number>} reportIds
   * @param {string} format
   * @returns {Promise<Blob>}
   */
  exportBulk(reportIds, format = "pdf") {
    return this.downloadBulk(reportIds, format);
  },

  /**
   * Fetch export history log.
   * @param {number} page
   * @param {number} size
   * @returns {Promise<Object>}
   */
  fetchHistory(page = 0, size = 10) {
    return api
      .get(API_ROUTES.EXPORT_HISTORY, { params: { page, size } })
      .then((r) => r.data);
  },

  /**
   * Alias for fetchHistory.
   * @param {number} page
   * @param {number} size
   * @returns {Promise<Object>}
   */
  getHistory(page = 0, size = 10) {
    return this.fetchHistory(page, size);
  },

  /**
   * Download past export file from history by export ID.
   * @param {string|number} exportId
   * @returns {Promise<Blob>}
   */
  downloadFromHistory(exportId) {
    return api
      .get(API_ROUTES.EXPORT_DOWNLOAD(exportId), { responseType: "blob" })
      .then((r) => r.data);
  },
};

export default exportService;
