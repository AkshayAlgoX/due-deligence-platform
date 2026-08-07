import api from "@/services/api";
import { API_ROUTES } from "@/constants/apiRoutes";

export const exportService = {
  async exportPdf(reportId) {
    const response = await api.get(API_ROUTES.EXPORT_PDF(reportId), {
      responseType: "blob",
    });
    return response.data;
  },

  async exportExcel(reportId) {
    const response = await api.get(API_ROUTES.EXPORT_EXCEL(reportId), {
      responseType: "blob",
    });
    return response.data;
  },

  async getPreview(reportId) {
    const response = await api.get(API_ROUTES.EXPORT_PREVIEW(reportId));
    return response.data;
  },

  async exportBulk(reportIds, format = "PDF") {
    const response = await api.post(
      API_ROUTES.EXPORT_BULK,
      { reportIds, format },
      { responseType: "blob" }
    );
    return response.data;
  },

  async getHistory(page = 0, size = 10) {
    const response = await api.get(
      `${API_ROUTES.EXPORT_HISTORY}?page=${page}&size=${size}`
    );
    return response.data;
  },

  async downloadFromHistory(exportId) {
    const response = await api.get(API_ROUTES.EXPORT_DOWNLOAD(exportId), {
      responseType: "blob",
    });
    return response.data;
  },
};
