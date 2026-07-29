import axiosInstance from "./axiosInstance";

// Bug fix: params (page/size/sort) were never forwarded, so adminUserSlice's
// fetchAllUsers(params) silently ignored pagination and always fetched page 0.
export const getUsers = (params = {}) =>
  axiosInstance.get("/api/admin/users", { params });

export const getUserById = (id) =>
  axiosInstance.get(`/api/admin/users/${id}`);

export const enableUser = (id) =>
  axiosInstance.patch(`/api/admin/users/${id}/enable`);

// Bug fix: this never accepted/forwarded a request body, so adminUserSlice's
// disableUser({ id, data: { duration } }) silently sent no body at all — the
// backend's @Valid DisableAccountRequest then rejected it with 400 "Disable
// duration is required" on every attempt.
export const disableUser = (id, data) =>
  axiosInstance.patch(`/api/admin/users/${id}/disable`, data);

export const deleteUser = (id) =>
  axiosInstance.delete(`/api/admin/users/${id}`);