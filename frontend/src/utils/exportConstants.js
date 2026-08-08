export const EXPORT_FORMATS = {
  PDF: "PDF",
  EXCEL: "EXCEL",
  ZIP: "ZIP",
};

export const EXPORT_STAGES = {
  IDLE: "IDLE",
  PREPARING: "PREPARING",
  FETCHING: "FETCHING",
  GENERATING: "GENERATING",
  RENDERING: "RENDERING",
  DOWNLOADING: "DOWNLOADING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};

export const EXPORT_MIME_TYPES = {
  PDF: "application/pdf",
  EXCEL: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ZIP: "application/zip",
};

export const DEFAULT_PAGE_SIZE = 10;
