import axiosInstance from "./axiosInstance";

export const getUser = (id) =>
  axiosInstance.get(`/api/users/${id}`);

export const updateUser = (id, data) =>
  axiosInstance.put(`/api/users/${id}`, data);

export const deleteMyAccount = () =>
  axiosInstance.delete("/api/users/me");