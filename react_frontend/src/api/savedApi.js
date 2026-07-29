import axiosInstance from "./axiosInstance";

// POST /api/saved-properties/{propertyId} — bookmark a listing
export const saveProperty = (propertyId) =>
  axiosInstance.post(`/api/saved-properties/${propertyId}`);

// DELETE /api/saved-properties/{propertyId} — remove a bookmark
export const unsaveProperty = (propertyId) =>
  axiosInstance.delete(`/api/saved-properties/${propertyId}`);

// GET /api/saved-properties — paginated, full PropertyResponse per saved listing
export const getMySavedProperties = (params = {}) =>
  axiosInstance.get("/api/saved-properties", { params });

// GET /api/saved-properties/ids — lightweight id list for heart-icon state
export const getMySavedPropertyIds = () =>
  axiosInstance.get("/api/saved-properties/ids");
