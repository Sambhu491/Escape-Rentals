import axiosInstance from "./axiosInstance";

// GET /api/user-reports — Admin only, filtered + paginated
// params: { status, type, reportedUserId, page, size, sort }
export const getUserReports = (params = {}) =>
  axiosInstance.get("/api/user-reports", { params });

// GET /api/user-reports/{id} — Admin only, single report
export const getUserReport = (id) =>
  axiosInstance.get(`/api/user-reports/${id}`);

// GET /api/user-reports/user/{userId} — Admin only, reports filed against one user
export const getReportsForUser = (userId, params = {}) =>
  axiosInstance.get(`/api/user-reports/user/${userId}`, { params });

// GET /api/user-reports/my — Reporter's own submissions, paginated
export const getMyUserReports = (params = {}) =>
  axiosInstance.get("/api/user-reports/my", { params });

// POST /api/user-reports — USER or HOST reports another user
// data: { reportedUserId, type, description }
export const createUserReport = (data) =>
  axiosInstance.post("/api/user-reports", data);

// PATCH /api/user-reports/{id}/status — Admin updates report status
// data: { status, adminNote? }
export const updateUserReportStatus = (id, data) =>
  axiosInstance.patch(`/api/user-reports/${id}/status`, data);
