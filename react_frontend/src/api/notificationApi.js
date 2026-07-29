import axiosInstance from "./axiosInstance";

// GET /api/notifications/my — paginated, current user only
export const getMyNotifications = (params = {}) =>
  axiosInstance.get("/api/notifications/my", { params });

// PATCH /api/notifications/{id}/read
export const markNotificationRead = (id) =>
  axiosInstance.patch(`/api/notifications/${id}/read`);

// PATCH /api/notifications/read-all — clears the navbar's unread indicator
export const markAllNotificationsRead = () =>
  axiosInstance.patch("/api/notifications/read-all");

// POST /api/contact
export const submitContact  = (data) =>
  axiosInstance.post("/api/contact",data);


export const deleteNotification = (id) =>
  axiosInstance.delete(`/api/notifications/${id}`);

export const deleteAllNotifications = () =>
  axiosInstance.delete("/api/notifications/all");


