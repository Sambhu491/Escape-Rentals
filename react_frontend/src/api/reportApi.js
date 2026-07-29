import axiosInstance from "./axiosInstance";

// GET /api/reports — Admin only, filtered + paginated
// params: { status, type, propertyId, reporterId, createdFrom, createdTo, page, size, sort }
export const getReports = (params = {}) =>
  axiosInstance.get("/api/reports", { params });

// GET /api/reports/{id} — Admin only, single report
export const getReport = (id) =>
  axiosInstance.get(`/api/reports/${id}`);

// GET /api/reports/my — Reporter's own submissions, paginated
// params: { page, size, sort }
export const getMyReports = (params = {}) =>
  axiosInstance.get("/api/reports/my", { params });

// POST /api/reports — USER or HOST creates a report
// data: { propertyId, type, description }
export const createReport = (data) =>
  axiosInstance.post("/api/reports", data);

// PATCH /api/reports/{id}/status — Admin updates report status
// data: { status, adminNote? }
export const updateReportStatus = (id, data) =>
  axiosInstance.patch(`/api/reports/${id}/status`, data);
