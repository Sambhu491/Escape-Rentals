import axiosInstance from "./axiosInstance";

export const getUserDashboard = () =>
  axiosInstance.get("/api/profile/user/dashboard");

export const getHostDashboard = () =>
  axiosInstance.get("/api/profile/host/dashboard");

export const getAdminDashboard = () =>
  axiosInstance.get("/api/admin/dashboard");